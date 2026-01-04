// Admin API Routes

import { Hono } from 'hono'
import { z } from 'zod'
import { query, queryOne, insert, update } from '../lib/db'
import { authMiddleware, requireRole } from '../middleware/auth'
import type { Bindings, APIResponse, JWTPayload } from '../types'

const admin = new Hono<{ Bindings: Bindings }>()

// All admin routes require admin role
admin.use('*', authMiddleware, requireRole('admin'))

// GET /api/admin/stats - Dashboard statistics
admin.get('/stats', async (c) => {
  try {
    const db = c.env.DB
    
    // Count users by role
    const usersStats = await query<{ role: string; count: number }>(
      db,
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    )
    
    // Count RFQs by status
    const rfqsStats = await query<{ status: string; count: number }>(
      db,
      `SELECT status, COUNT(*) as count FROM rfqs GROUP BY status`
    )
    
    // Count bids by status
    const bidsStats = await query<{ status: string; count: number }>(
      db,
      `SELECT status, COUNT(*) as count FROM bids GROUP BY status`
    )
    
    // Count orders by status
    const ordersStats = await query<{ status: string; count: number }>(
      db,
      `SELECT status, COUNT(*) as count FROM orders GROUP BY status`
    )
    
    // Revenue stats
    const revenueResult = await queryOne<{ total: number }>(
      db,
      `SELECT SUM(total_amount) as total FROM orders WHERE status IN ('delivered', 'completed')`
    )
    
    return c.json<APIResponse>({
      success: true,
      data: {
        users: usersStats.results || [],
        rfqs: rfqsStats.results || [],
        bids: bidsStats.results || [],
        orders: ordersStats.results || [],
        revenue: revenueResult?.total || 0
      }
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch statistics',
      error_ar: 'فشل في جلب الإحصائيات'
    }, 500)
  }
})

// GET /api/admin/users - List all users
admin.get('/users', async (c) => {
  try {
    const { role, status, page = '1', limit = '20' } = c.req.query()
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    let sql = `SELECT id, email, role, status, created_at FROM users WHERE 1=1`
    const params: any[] = []
    
    if (role) {
      sql += ` AND role = ?`
      params.push(role)
    }
    
    if (status) {
      sql += ` AND status = ?`
      params.push(status)
    }
    
    // Count total
    const countResult = await query<{ count: number }>(
      c.env.DB,
      sql.replace('SELECT id, email, role, status, created_at', 'SELECT COUNT(*) as count'),
      params
    )
    const total = countResult.results?.[0]?.count || 0
    
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(limitNum, offset)
    
    const result = await query(c.env.DB, sql, params)
    
    return c.json<APIResponse>({
      success: true,
      data: {
        users: result.results || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error: any) {
    console.error('Users list error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch users',
      error_ar: 'فشل في جلب المستخدمين'
    }, 500)
  }
})

// PUT /api/admin/users/:id/status - Update user status
admin.put('/users/:id/status', async (c) => {
  try {
    const id = c.req.param('id')
    const { status } = await c.req.json()
    
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid status',
        error_ar: 'حالة غير صحيحة'
      }, 400)
    }
    
    await update(c.env.DB, 'users', { status }, { id: parseInt(id) })
    
    return c.json<APIResponse>({
      success: true,
      message: 'User status updated',
      message_ar: 'تم تحديث حالة المستخدم'
    })
  } catch (error: any) {
    console.error('Update user status error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to update user status',
      error_ar: 'فشل في تحديث حالة المستخدم'
    }, 500)
  }
})

// GET /api/admin/rfqs - List all RFQs
admin.get('/rfqs', async (c) => {
  try {
    const { status, page = '1', limit = '20' } = c.req.query()
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    let sql = `
      SELECT r.*, u.email as buyer_email,
        (SELECT COUNT(*) FROM bids WHERE rfq_id = r.id) as bid_count
      FROM rfqs r
      JOIN users u ON r.buyer_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (status) {
      sql += ` AND r.status = ?`
      params.push(status)
    }
    
    // Count total
    const countResult = await query<{ count: number }>(
      c.env.DB,
      sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as count FROM'),
      params
    )
    const total = countResult.results?.[0]?.count || 0
    
    sql += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`
    params.push(limitNum, offset)
    
    const result = await query(c.env.DB, sql, params)
    
    return c.json<APIResponse>({
      success: true,
      data: {
        rfqs: result.results || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error: any) {
    console.error('Admin RFQs list error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch RFQs',
      error_ar: 'فشل في جلب طلبات العروض'
    }, 500)
  }
})

// GET /api/admin/bids/:rfqId - Get all bids for an RFQ
admin.get('/bids/:rfqId', async (c) => {
  try {
    const rfqId = c.req.param('rfqId')
    
    const result = await query(
      c.env.DB,
      `SELECT b.*, u.email as vendor_email, vp.company_name
       FROM bids b
       JOIN users u ON b.vendor_id = u.id
       JOIN vendor_profiles vp ON b.vendor_profile_id = vp.id
       WHERE b.rfq_id = ?
       ORDER BY b.total_amount ASC`,
      [rfqId]
    )
    
    return c.json<APIResponse>({
      success: true,
      data: {
        bids: result.results || []
      }
    })
  } catch (error: any) {
    console.error('Admin bids list error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch bids',
      error_ar: 'فشل في جلب العروض'
    }, 500)
  }
})

// PUT /api/admin/bids/:id/status - Update bid status (accept/reject)
admin.put('/bids/:id/status', async (c) => {
  try {
    const id = c.req.param('id')
    const { status, notes } = await c.req.json()
    
    if (!['accepted', 'rejected'].includes(status)) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid status',
        error_ar: 'حالة غير صحيحة'
      }, 400)
    }
    
    const user = c.get('user') as JWTPayload
    
    await update(c.env.DB, 'bids', 
      { 
        status,
        reviewed_by: user.userId,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null
      },
      { id: parseInt(id) }
    )
    
    return c.json<APIResponse>({
      success: true,
      message: `Bid ${status}`,
      message_ar: status === 'accepted' ? 'تم قبول العرض' : 'تم رفض العرض'
    })
  } catch (error: any) {
    console.error('Update bid status error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to update bid status',
      error_ar: 'فشل في تحديث حالة العرض'
    }, 500)
  }
})

// GET /api/admin/orders - List all orders
admin.get('/orders', async (c) => {
  try {
    const { status, page = '1', limit = '20' } = c.req.query()
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    let sql = `
      SELECT o.*, u.email as buyer_email
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    
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
    console.error('Admin orders list error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch orders',
      error_ar: 'فشل في جلب الطلبات'
    }, 500)
  }
})

// PUT /api/admin/orders/:id/qa - Update order QA status
admin.put('/orders/:id/qa', async (c) => {
  try {
    const id = c.req.param('id')
    const { qa_status, qa_notes } = await c.req.json()
    
    if (!['pending', 'passed', 'failed'].includes(qa_status)) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid QA status',
        error_ar: 'حالة فحص جودة غير صحيحة'
      }, 400)
    }
    
    const user = c.get('user') as JWTPayload
    
    await update(c.env.DB, 'orders', 
      { 
        qa_status,
        qa_notes: qa_notes || null,
        qa_checked_by: user.userId,
        qa_checked_at: new Date().toISOString()
      },
      { id: parseInt(id) }
    )
    
    return c.json<APIResponse>({
      success: true,
      message: 'QA status updated',
      message_ar: 'تم تحديث حالة فحص الجودة'
    })
  } catch (error: any) {
    console.error('Update QA status error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to update QA status',
      error_ar: 'فشل في تحديث حالة فحص الجودة'
    }, 500)
  }
})

export default admin
