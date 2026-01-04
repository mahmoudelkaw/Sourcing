// Vendor Bid API Routes

import { Hono } from 'hono'
import { z } from 'zod'
import { query, queryOne, insert, update, generateReferenceNumber } from '../lib/db'
import { authMiddleware, requireRole } from '../middleware/auth'
import type { Bindings, Bid, BidItem, APIResponse, JWTPayload } from '../types'

const bids = new Hono<{ Bindings: Bindings }>()

// All bid routes require authentication
bids.use('*', authMiddleware)

// Validation schemas
const createBidSchema = z.object({
  rfq_id: z.number().positive(),
  notes: z.string().optional(),
  items: z.array(z.object({
    rfq_item_id: z.number().positive(),
    unit_price: z.number().positive(),
    lead_time_days: z.number().positive(),
    notes: z.string().optional()
  })).min(1)
})

// POST /api/bids - Create new bid (vendor only)
bids.post('/', requireRole('vendor'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const body = await c.req.json()
    const validation = createBidSchema.safeParse(body)
    
    if (!validation.success) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid input: ' + validation.error.message,
        error_ar: 'بيانات غير صحيحة'
      }, 400)
    }
    
    const data = validation.data
    const db = c.env.DB
    
    // Get vendor profile
    const vendorProfile = await queryOne<{ id: number }>(
      db,
      'SELECT id FROM vendor_profiles WHERE user_id = ?',
      [user.userId]
    )
    
    if (!vendorProfile) {
      return c.json<APIResponse>({
        success: false,
        error: 'Vendor profile not found',
        error_ar: 'ملف المورد غير موجود'
      }, 404)
    }
    
    // Verify RFQ exists and is open
    const rfq = await queryOne<{ id: number; status: string }>(
      db,
      'SELECT id, status FROM rfqs WHERE id = ?',
      [data.rfq_id]
    )
    
    if (!rfq) {
      return c.json<APIResponse>({
        success: false,
        error: 'RFQ not found',
        error_ar: 'طلب العرض غير موجود'
      }, 404)
    }
    
    if (rfq.status !== 'submitted' && rfq.status !== 'pending') {
      return c.json<APIResponse>({
        success: false,
        error: 'RFQ is not accepting bids',
        error_ar: 'طلب العرض لا يقبل عروضاً جديدة'
      }, 400)
    }
    
    // Check if vendor already submitted bid
    const existingBid = await queryOne<{ id: number }>(
      db,
      'SELECT id FROM bids WHERE rfq_id = ? AND vendor_id = ?',
      [data.rfq_id, user.userId]
    )
    
    if (existingBid) {
      return c.json<APIResponse>({
        success: false,
        error: 'You already submitted a bid for this RFQ',
        error_ar: 'لقد قدمت عرضاً لهذا الطلب بالفعل'
      }, 400)
    }
    
    // Calculate total
    let totalAmount = 0
    for (const item of data.items) {
      // Get quantity from RFQ item
      const rfqItem = await queryOne<{ quantity: number }>(
        db,
        'SELECT quantity FROM rfq_items WHERE id = ? AND rfq_id = ?',
        [item.rfq_item_id, data.rfq_id]
      )
      
      if (!rfqItem) {
        return c.json<APIResponse>({
          success: false,
          error: `RFQ item ${item.rfq_item_id} not found`,
          error_ar: 'عنصر طلب العرض غير موجود'
        }, 404)
      }
      
      totalAmount += item.unit_price * rfqItem.quantity
    }
    
    // Generate bid number
    const bidNumber = generateReferenceNumber('BID')
    
    // Create bid
    const bidResult = await insert(db, 'bids', {
      bid_number: bidNumber,
      rfq_id: data.rfq_id,
      vendor_id: user.userId,
      vendor_profile_id: vendorProfile.id,
      total_amount: totalAmount,
      notes: data.notes || null,
      status: 'pending'
    })
    
    if (!bidResult.success || !bidResult.lastRowId) {
      throw new Error('Failed to create bid')
    }
    
    const bidId = bidResult.lastRowId
    
    // Insert bid items
    for (const item of data.items) {
      // Get quantity again
      const rfqItem = await queryOne<{ quantity: number }>(
        db,
        'SELECT quantity FROM rfq_items WHERE id = ?',
        [item.rfq_item_id]
      )
      
      const lineTotal = item.unit_price * (rfqItem?.quantity || 0)
      
      await insert(db, 'bid_items', {
        bid_id: bidId,
        rfq_item_id: item.rfq_item_id,
        unit_price: item.unit_price,
        lead_time_days: item.lead_time_days,
        line_total: lineTotal,
        notes: item.notes || null
      })
    }
    
    return c.json<APIResponse>({
      success: true,
      message: 'Bid submitted successfully',
      message_ar: 'تم إرسال العرض بنجاح',
      data: {
        bid_id: bidId,
        bid_number: bidNumber
      }
    }, 201)
    
  } catch (error: any) {
    console.error('Bid creation error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to create bid',
      error_ar: 'فشل في إنشاء العرض'
    }, 500)
  }
})

// GET /api/bids - List vendor's bids
bids.get('/', requireRole('vendor'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const { status, page = '1', limit = '20' } = c.req.query()
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    let sql = `
      SELECT b.*, r.rfq_number, r.title, r.title_ar
      FROM bids b
      JOIN rfqs r ON b.rfq_id = r.id
      WHERE b.vendor_id = ?
    `
    const params: any[] = [user.userId]
    
    if (status) {
      sql += ` AND b.status = ?`
      params.push(status)
    }
    
    // Count total
    const countResult = await query<{ count: number }>(
      c.env.DB,
      sql.replace('SELECT b.*, r.rfq_number, r.title, r.title_ar', 'SELECT COUNT(*) as count'),
      params
    )
    const total = countResult.results?.[0]?.count || 0
    
    sql += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`
    params.push(limitNum, offset)
    
    const result = await query<Bid>(c.env.DB, sql, params)
    
    return c.json<APIResponse>({
      success: true,
      data: {
        bids: result.results || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error: any) {
    console.error('Bid list error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch bids',
      error_ar: 'فشل في جلب العروض'
    }, 500)
  }
})

// GET /api/bids/rfqs - List available RFQs for vendor to bid on
bids.get('/rfqs', requireRole('vendor'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const { page = '1', limit = '20' } = c.req.query()
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    // Get RFQs that vendor hasn't bid on yet
    const sql = `
      SELECT r.*, 
        (SELECT COUNT(*) FROM rfq_items WHERE rfq_id = r.id) as item_count,
        CASE WHEN b.id IS NOT NULL THEN 1 ELSE 0 END as has_bid
      FROM rfqs r
      LEFT JOIN bids b ON r.id = b.rfq_id AND b.vendor_id = ?
      WHERE r.status IN ('submitted', 'pending')
      AND b.id IS NULL
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `
    
    const result = await query(c.env.DB, sql, [user.userId, limitNum, offset])
    
    // Count total
    const countSql = `
      SELECT COUNT(*) as count
      FROM rfqs r
      LEFT JOIN bids b ON r.id = b.rfq_id AND b.vendor_id = ?
      WHERE r.status IN ('submitted', 'pending')
      AND b.id IS NULL
    `
    const countResult = await query<{ count: number }>(c.env.DB, countSql, [user.userId])
    const total = countResult.results?.[0]?.count || 0
    
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
    console.error('Available RFQs error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch available RFQs',
      error_ar: 'فشل في جلب طلبات العروض المتاحة'
    }, 500)
  }
})

// GET /api/bids/rfqs/:id - Get RFQ details for bidding
bids.get('/rfqs/:id', requireRole('vendor'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const id = c.req.param('id')
    const db = c.env.DB
    
    // Get RFQ
    const rfq = await queryOne(
      db,
      'SELECT * FROM rfqs WHERE id = ? AND status IN ("submitted", "pending")',
      [id]
    )
    
    if (!rfq) {
      return c.json<APIResponse>({
        success: false,
        error: 'RFQ not found or not accepting bids',
        error_ar: 'طلب العرض غير موجود أو لا يقبل عروضاً'
      }, 404)
    }
    
    // Check if vendor already bid
    const existingBid = await queryOne(
      db,
      'SELECT id FROM bids WHERE rfq_id = ? AND vendor_id = ?',
      [id, user.userId]
    )
    
    if (existingBid) {
      return c.json<APIResponse>({
        success: false,
        error: 'You already submitted a bid for this RFQ',
        error_ar: 'لقد قدمت عرضاً لهذا الطلب بالفعل'
      }, 400)
    }
    
    // Get items
    const itemsResult = await query(
      db,
      'SELECT * FROM rfq_items WHERE rfq_id = ? ORDER BY line_number ASC',
      [id]
    )
    
    return c.json<APIResponse>({
      success: true,
      data: {
        rfq,
        items: itemsResult.results || []
      }
    })
  } catch (error: any) {
    console.error('RFQ fetch error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch RFQ',
      error_ar: 'فشل في جلب طلب العرض'
    }, 500)
  }
})

// GET /api/bids/:id - Get bid details
bids.get('/:id', requireRole('vendor'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const id = c.req.param('id')
    const db = c.env.DB
    
    // Get bid
    const bid = await queryOne(
      db,
      'SELECT * FROM bids WHERE id = ? AND vendor_id = ?',
      [id, user.userId]
    )
    
    if (!bid) {
      return c.json<APIResponse>({
        success: false,
        error: 'Bid not found',
        error_ar: 'العرض غير موجود'
      }, 404)
    }
    
    // Get bid items with RFQ item details
    const itemsResult = await query(
      db,
      `SELECT bi.*, ri.item_name, ri.item_name_ar, ri.quantity, ri.unit, ri.unit_ar
       FROM bid_items bi
       JOIN rfq_items ri ON bi.rfq_item_id = ri.id
       WHERE bi.bid_id = ?`,
      [id]
    )
    
    return c.json<APIResponse>({
      success: true,
      data: {
        bid,
        items: itemsResult.results || []
      }
    })
  } catch (error: any) {
    console.error('Bid fetch error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch bid',
      error_ar: 'فشل في جلب العرض'
    }, 500)
  }
})

export default bids
