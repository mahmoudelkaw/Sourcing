// Orders API Routes

import { Hono } from 'hono'
import { z } from 'zod'
import { query, queryOne, insert, update, generateReferenceNumber } from '../lib/db'
import { authMiddleware, requireRole } from '../middleware/auth'
import type { Bindings, APIResponse, JWTPayload } from '../types'

const orders = new Hono<{ Bindings: Bindings }>()

// All order routes require authentication
orders.use('*', authMiddleware)

// POST /api/orders - Create order from accepted bid (admin only)
orders.post('/', requireRole('admin'), async (c) => {
  try {
    const { bid_id } = await c.req.json()
    const user = c.get('user') as JWTPayload
    const db = c.env.DB
    
    if (!bid_id) {
      return c.json<APIResponse>({
        success: false,
        error: 'Bid ID is required',
        error_ar: 'معرف العرض مطلوب'
      }, 400)
    }
    
    // Get bid details with RFQ info
    const bid = await queryOne(
      db,
      `SELECT b.*, r.buyer_id, r.buyer_profile_id, r.rfq_number, r.title, r.delivery_address
       FROM bids b
       JOIN rfqs r ON b.rfq_id = r.id
       WHERE b.id = ?`,
      [bid_id]
    )
    
    if (!bid) {
      return c.json<APIResponse>({
        success: false,
        error: 'Bid not found',
        error_ar: 'العرض غير موجود'
      }, 404)
    }
    
    // Check if bid is accepted
    if (bid.status !== 'accepted') {
      return c.json<APIResponse>({
        success: false,
        error: 'Only accepted bids can be converted to orders',
        error_ar: 'فقط العروض المقبولة يمكن تحويلها إلى طلبات'
      }, 400)
    }
    
    // Check if order already exists for this bid
    const existingOrder = await queryOne(
      db,
      'SELECT id FROM orders WHERE bid_id = ?',
      [bid_id]
    )
    
    if (existingOrder) {
      return c.json<APIResponse>({
        success: false,
        error: 'Order already exists for this bid',
        error_ar: 'الطلب موجود بالفعل لهذا العرض'
      }, 400)
    }
    
    // Generate order number
    const orderNumber = generateReferenceNumber('ORD')
    
    // Calculate Lesorce markup (7%)
    const vendorAmount = bid.total_amount
    const markupPercent = 0.07
    const markupAmount = vendorAmount * markupPercent
    const buyerTotal = vendorAmount + markupAmount
    
    // Create order
    const orderResult = await insert(db, 'orders', {
      order_number: orderNumber,
      rfq_id: bid.rfq_id,
      bid_id: bid.id,
      buyer_id: bid.buyer_id,
      buyer_profile_id: bid.buyer_profile_id,
      vendor_id: bid.vendor_id,
      vendor_profile_id: bid.vendor_profile_id,
      subtotal: vendorAmount,
      markup_amount: markupAmount,
      markup_percent: markupPercent,
      total_amount: buyerTotal,
      delivery_address: bid.delivery_address,
      status: 'pending_payment',
      qa_status: 'pending',
      created_by: user.userId
    })
    
    if (!orderResult.success || !orderResult.lastRowId) {
      throw new Error('Failed to create order')
    }
    
    const orderId = orderResult.lastRowId
    
    // Get bid items with RFQ item details
    const bidItems = await query(
      db,
      `SELECT bi.*, ri.item_name, ri.item_name_ar, ri.quantity, ri.unit, ri.unit_ar
       FROM bid_items bi
       JOIN rfq_items ri ON bi.rfq_item_id = ri.id
       WHERE bi.bid_id = ?`,
      [bid_id]
    )
    
    // Create order items
    for (const item of bidItems.results || []) {
      await insert(db, 'order_items', {
        order_id: orderId,
        rfq_item_id: item.rfq_item_id,
        item_name: item.item_name,
        item_name_ar: item.item_name_ar,
        quantity: item.quantity,
        unit: item.unit,
        unit_ar: item.unit_ar,
        vendor_unit_price: item.unit_price,
        buyer_unit_price: item.unit_price * (1 + markupPercent),
        line_total: item.line_total * (1 + markupPercent)
      })
    }
    
    // Update RFQ status
    await update(db, 'rfqs', { status: 'converted_to_order' }, { id: bid.rfq_id })
    
    return c.json<APIResponse>({
      success: true,
      message: 'Order created successfully',
      message_ar: 'تم إنشاء الطلب بنجاح',
      data: {
        order_id: orderId,
        order_number: orderNumber,
        buyer_total: buyerTotal,
        vendor_amount: vendorAmount,
        markup: markupAmount
      }
    }, 201)
    
  } catch (error: any) {
    console.error('Order creation error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to create order',
      error_ar: 'فشل في إنشاء الطلب'
    }, 500)
  }
})

// GET /api/orders - List orders (role-based)
orders.get('/', async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const { status, page = '1', limit = '20' } = c.req.query()
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    let sql = `
      SELECT o.*, 
        bu.email as buyer_email,
        bp.company_name as buyer_company,
        vu.email as vendor_email,
        vp.company_name as vendor_company
      FROM orders o
      JOIN users bu ON o.buyer_id = bu.id
      JOIN buyer_profiles bp ON o.buyer_profile_id = bp.id
      JOIN users vu ON o.vendor_id = vu.id
      JOIN vendor_profiles vp ON o.vendor_profile_id = vp.id
      WHERE 1=1
    `
    const params: any[] = []
    
    // Role-based filtering
    if (user.role === 'buyer') {
      sql += ` AND o.buyer_id = ?`
      params.push(user.userId)
    } else if (user.role === 'vendor') {
      sql += ` AND o.vendor_id = ?`
      params.push(user.userId)
    }
    // Admin sees all orders
    
    if (status) {
      sql += ` AND o.status = ?`
      params.push(status)
    }
    
    // Count total
    const countResult = await query<{ count: number }>(
      c.env.DB,
      sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as count FROM'),
      params
    )
    const total = countResult.results?.[0]?.count || 0
    
    sql += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
    params.push(limitNum, offset)
    
    const result = await query(c.env.DB, sql, params)
    
    return c.json<APIResponse>({
      success: true,
      data: {
        orders: result.results || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error: any) {
    console.error('Orders list error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch orders',
      error_ar: 'فشل في جلب الطلبات'
    }, 500)
  }
})

// GET /api/orders/:id - Get order details
orders.get('/:id', async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const id = c.req.param('id')
    const db = c.env.DB
    
    // Get order with buyer/vendor details
    let sql = `
      SELECT o.*, 
        bu.email as buyer_email,
        bp.company_name as buyer_company,
        bp.company_name_ar as buyer_company_ar,
        vu.email as vendor_email,
        vp.company_name as vendor_company,
        vp.company_name_ar as vendor_company_ar,
        r.rfq_number,
        r.title as rfq_title
      FROM orders o
      JOIN users bu ON o.buyer_id = bu.id
      JOIN buyer_profiles bp ON o.buyer_profile_id = bp.id
      JOIN users vu ON o.vendor_id = vu.id
      JOIN vendor_profiles vp ON o.vendor_profile_id = vp.id
      JOIN rfqs r ON o.rfq_id = r.id
      WHERE o.id = ?
    `
    
    // Role-based access control
    if (user.role === 'buyer') {
      sql += ` AND o.buyer_id = ?`
    } else if (user.role === 'vendor') {
      sql += ` AND o.vendor_id = ?`
    }
    
    const params = user.role === 'admin' ? [id] : [id, user.userId]
    const order = await queryOne(db, sql, params)
    
    if (!order) {
      return c.json<APIResponse>({
        success: false,
        error: 'Order not found',
        error_ar: 'الطلب غير موجود'
      }, 404)
    }
    
    // Get order items
    const itemsResult = await query(
      db,
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC',
      [id]
    )
    
    // Get payment info
    const payment = await queryOne(
      db,
      'SELECT * FROM payments WHERE order_id = ?',
      [id]
    )
    
    return c.json<APIResponse>({
      success: true,
      data: {
        order,
        items: itemsResult.results || [],
        payment: payment || null
      }
    })
  } catch (error: any) {
    console.error('Order fetch error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch order',
      error_ar: 'فشل في جلب الطلب'
    }, 500)
  }
})

// PUT /api/orders/:id/status - Update order status
orders.put('/:id/status', async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const id = c.req.param('id')
    const { status, notes } = await c.req.json()
    const db = c.env.DB
    
    // Valid status transitions
    const validStatuses = [
      'pending_payment',
      'payment_received',
      'confirmed',
      'in_warehouse',
      'qa_pending',
      'qa_passed',
      'qa_failed',
      'shipped',
      'delivered',
      'completed',
      'cancelled'
    ]
    
    if (!validStatuses.includes(status)) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid status',
        error_ar: 'حالة غير صحيحة'
      }, 400)
    }
    
    // Check permissions
    if (user.role !== 'admin') {
      return c.json<APIResponse>({
        success: false,
        error: 'Only admin can update order status',
        error_ar: 'المسؤول فقط يمكنه تحديث حالة الطلب'
      }, 403)
    }
    
    const updateData: any = { status }
    
    // Add status-specific fields
    if (status === 'payment_received') {
      updateData.payment_received_at = new Date().toISOString()
    } else if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    } else if (status === 'shipped') {
      updateData.shipped_at = new Date().toISOString()
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }
    
    if (notes) {
      updateData.notes = notes
    }
    
    await update(db, 'orders', updateData, { id: parseInt(id) })
    
    return c.json<APIResponse>({
      success: true,
      message: 'Order status updated',
      message_ar: 'تم تحديث حالة الطلب'
    })
  } catch (error: any) {
    console.error('Update order status error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to update order status',
      error_ar: 'فشل في تحديث حالة الطلب'
    }, 500)
  }
})

// POST /api/orders/:id/confirm-payment - Buyer confirms payment made
orders.post('/:id/confirm-payment', requireRole('buyer'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const id = c.req.param('id')
    const { payment_method, transaction_reference } = await c.req.json()
    const db = c.env.DB
    
    // Verify order belongs to buyer
    const order = await queryOne(
      db,
      'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
      [id, user.userId]
    )
    
    if (!order) {
      return c.json<APIResponse>({
        success: false,
        error: 'Order not found',
        error_ar: 'الطلب غير موجود'
      }, 404)
    }
    
    if (order.status !== 'pending_payment') {
      return c.json<APIResponse>({
        success: false,
        error: 'Order is not pending payment',
        error_ar: 'الطلب لا ينتظر الدفع'
      }, 400)
    }
    
    // Create payment record
    const paymentNumber = generateReferenceNumber('PAY')
    
    await insert(db, 'payments', {
      payment_number: paymentNumber,
      order_id: order.id,
      buyer_id: user.userId,
      amount: order.total_amount,
      payment_method: payment_method || 'bank_transfer',
      transaction_reference: transaction_reference || null,
      status: 'pending_verification',
      payment_type: 'buyer_payment'
    })
    
    // Update order status
    await update(db, 'orders', 
      { 
        status: 'payment_received',
        payment_received_at: new Date().toISOString()
      },
      { id: order.id }
    )
    
    return c.json<APIResponse>({
      success: true,
      message: 'Payment confirmation received',
      message_ar: 'تم استلام تأكيد الدفع',
      data: {
        payment_number: paymentNumber
      }
    })
  } catch (error: any) {
    console.error('Confirm payment error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to confirm payment',
      error_ar: 'فشل في تأكيد الدفع'
    }, 500)
  }
})

export default orders
