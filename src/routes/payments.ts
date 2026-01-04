// Payments API Routes - Escrow System

import { Hono } from 'hono'
import { z } from 'zod'
import { query, queryOne, insert, update, generateReferenceNumber } from '../lib/db'
import { authMiddleware, requireRole } from '../middleware/auth'
import type { Bindings, APIResponse, JWTPayload } from '../types'

const payments = new Hono<{ Bindings: Bindings }>()

// All payment routes require authentication
payments.use('*', authMiddleware)

// GET /api/payments - List payments (role-based)
payments.get('/', async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const { status, type, page = '1', limit = '20' } = c.req.query()
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    let sql = `
      SELECT p.*, o.order_number, o.total_amount as order_total,
        u.email as payer_email
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      LEFT JOIN users u ON p.buyer_id = u.id OR p.vendor_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    
    // Role-based filtering
    if (user.role === 'buyer') {
      sql += ` AND p.buyer_id = ?`
      params.push(user.userId)
    } else if (user.role === 'vendor') {
      sql += ` AND (p.vendor_id = ? OR p.payment_type = 'vendor_payment')`
      params.push(user.userId)
    }
    
    if (status) {
      sql += ` AND p.status = ?`
      params.push(status)
    }
    
    if (type) {
      sql += ` AND p.payment_type = ?`
      params.push(type)
    }
    
    // Count total
    const countResult = await query<{ count: number }>(
      c.env.DB,
      sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as count FROM'),
      params
    )
    const total = countResult.results?.[0]?.count || 0
    
    sql += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    params.push(limitNum, offset)
    
    const result = await query(c.env.DB, sql, params)
    
    return c.json<APIResponse>({
      success: true,
      data: {
        payments: result.results || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error: any) {
    console.error('Payments list error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch payments',
      error_ar: 'فشل في جلب المدفوعات'
    }, 500)
  }
})

// GET /api/payments/:id - Get payment details
payments.get('/:id', async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const id = c.req.param('id')
    const db = c.env.DB
    
    let sql = `
      SELECT p.*, o.order_number, o.total_amount as order_total,
        o.status as order_status
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE p.id = ?
    `
    
    // Role-based access control
    if (user.role === 'buyer') {
      sql += ` AND p.buyer_id = ?`
    } else if (user.role === 'vendor') {
      sql += ` AND p.vendor_id = ?`
    }
    
    const params = user.role === 'admin' ? [id] : [id, user.userId]
    const payment = await queryOne(db, sql, params)
    
    if (!payment) {
      return c.json<APIResponse>({
        success: false,
        error: 'Payment not found',
        error_ar: 'الدفع غير موجود'
      }, 404)
    }
    
    return c.json<APIResponse>({
      success: true,
      data: { payment }
    })
  } catch (error: any) {
    console.error('Payment fetch error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch payment',
      error_ar: 'فشل في جلب الدفع'
    }, 500)
  }
})

// PUT /api/payments/:id/verify - Admin verifies buyer payment
payments.put('/:id/verify', requireRole('admin'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const id = c.req.param('id')
    const { verified, notes } = await c.req.json()
    const db = c.env.DB
    
    // Get payment
    const payment = await queryOne(
      db,
      'SELECT * FROM payments WHERE id = ? AND payment_type = "buyer_payment"',
      [id]
    )
    
    if (!payment) {
      return c.json<APIResponse>({
        success: false,
        error: 'Payment not found',
        error_ar: 'الدفع غير موجود'
      }, 404)
    }
    
    if (payment.status !== 'pending_verification') {
      return c.json<APIResponse>({
        success: false,
        error: 'Payment is not pending verification',
        error_ar: 'الدفع ليس في انتظار التحقق'
      }, 400)
    }
    
    const newStatus = verified ? 'verified' : 'rejected'
    
    await update(db, 'payments',
      {
        status: newStatus,
        verified_by: user.userId,
        verified_at: new Date().toISOString(),
        verification_notes: notes || null
      },
      { id: payment.id }
    )
    
    // If verified, update order status to confirmed
    if (verified) {
      await update(db, 'orders',
        {
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        },
        { id: payment.order_id }
      )
    }
    
    return c.json<APIResponse>({
      success: true,
      message: verified ? 'Payment verified' : 'Payment rejected',
      message_ar: verified ? 'تم التحقق من الدفع' : 'تم رفض الدفع'
    })
  } catch (error: any) {
    console.error('Verify payment error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to verify payment',
      error_ar: 'فشل في التحقق من الدفع'
    }, 500)
  }
})

// POST /api/payments/:id/release - Admin releases payment to vendor (escrow release)
payments.post('/:id/release', requireRole('admin'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const id = c.req.param('id')
    const { release_amount, notes } = await c.req.json()
    const db = c.env.DB
    
    // Get buyer payment
    const payment = await queryOne(
      db,
      `SELECT p.*, o.vendor_id, o.vendor_profile_id, o.subtotal, o.qa_status
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = ? AND p.payment_type = 'buyer_payment'`,
      [id]
    )
    
    if (!payment) {
      return c.json<APIResponse>({
        success: false,
        error: 'Payment not found',
        error_ar: 'الدفع غير موجود'
      }, 404)
    }
    
    if (payment.status !== 'verified') {
      return c.json<APIResponse>({
        success: false,
        error: 'Payment must be verified before release',
        error_ar: 'يجب التحقق من الدفع قبل الإفراج'
      }, 400)
    }
    
    // Check QA status
    if (payment.qa_status !== 'passed') {
      return c.json<APIResponse>({
        success: false,
        error: 'Order must pass QA before payment release',
        error_ar: 'يجب أن يجتاز الطلب فحص الجودة قبل إطلاق الدفع'
      }, 400)
    }
    
    // Check if already released
    const existingVendorPayment = await queryOne(
      db,
      'SELECT id FROM payments WHERE order_id = ? AND payment_type = "vendor_payment"',
      [payment.order_id]
    )
    
    if (existingVendorPayment) {
      return c.json<APIResponse>({
        success: false,
        error: 'Payment already released to vendor',
        error_ar: 'تم إطلاق الدفع للمورد بالفعل'
      }, 400)
    }
    
    // Calculate release amount (default to vendor subtotal)
    const amountToRelease = release_amount || payment.subtotal
    
    if (amountToRelease > payment.subtotal) {
      return c.json<APIResponse>({
        success: false,
        error: 'Release amount cannot exceed vendor subtotal',
        error_ar: 'مبلغ الإفراج لا يمكن أن يتجاوز المبلغ الفرعي للمورد'
      }, 400)
    }
    
    // Create vendor payment record
    const vendorPaymentNumber = generateReferenceNumber('VPAY')
    
    await insert(db, 'payments', {
      payment_number: vendorPaymentNumber,
      order_id: payment.order_id,
      vendor_id: payment.vendor_id,
      amount: amountToRelease,
      payment_method: 'bank_transfer',
      status: 'released',
      payment_type: 'vendor_payment',
      released_by: user.userId,
      released_at: new Date().toISOString(),
      notes: notes || null
    })
    
    // Update buyer payment status
    await update(db, 'payments',
      {
        status: 'released',
        released_at: new Date().toISOString()
      },
      { id: payment.id }
    )
    
    // Update order status
    await update(db, 'orders',
      { status: 'completed', completed_at: new Date().toISOString() },
      { id: payment.order_id }
    )
    
    return c.json<APIResponse>({
      success: true,
      message: 'Payment released to vendor',
      message_ar: 'تم إطلاق الدفع للمورد',
      data: {
        vendor_payment_number: vendorPaymentNumber,
        amount_released: amountToRelease
      }
    })
  } catch (error: any) {
    console.error('Release payment error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to release payment',
      error_ar: 'فشل في إطلاق الدفع'
    }, 500)
  }
})

// GET /api/payments/escrow/summary - Get escrow summary (admin only)
payments.get('/escrow/summary', requireRole('admin'), async (c) => {
  try {
    const db = c.env.DB
    
    // Total buyer payments received
    const buyerPayments = await queryOne<{ total: number, count: number }>(
      db,
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM payments
       WHERE payment_type = 'buyer_payment' AND status IN ('verified', 'released')`
    )
    
    // Total vendor payments released
    const vendorPayments = await queryOne<{ total: number, count: number }>(
      db,
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM payments
       WHERE payment_type = 'vendor_payment' AND status = 'released'`
    )
    
    // Amount in escrow (verified but not released)
    const escrowBalance = await queryOne<{ total: number }>(
      db,
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM payments
       WHERE payment_type = 'buyer_payment' AND status = 'verified'`
    )
    
    // Pending verification
    const pendingPayments = await queryOne<{ total: number, count: number }>(
      db,
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM payments
       WHERE status = 'pending_verification'`
    )
    
    const buyerTotal = buyerPayments?.total || 0
    const vendorTotal = vendorPayments?.total || 0
    const sourcssingRevenue = buyerTotal - vendorTotal
    
    return c.json<APIResponse>({
      success: true,
      data: {
        buyer_payments: {
          total: buyerTotal,
          count: buyerPayments?.count || 0
        },
        vendor_payments: {
          total: vendorTotal,
          count: vendorPayments?.count || 0
        },
        escrow_balance: escrowBalance?.total || 0,
        pending_verification: {
          total: pendingPayments?.total || 0,
          count: pendingPayments?.count || 0
        },
        sourssing_revenue: sourcssingRevenue
      }
    })
  } catch (error: any) {
    console.error('Escrow summary error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch escrow summary',
      error_ar: 'فشل في جلب ملخص الضمان'
    }, 500)
  }
})

export default payments
