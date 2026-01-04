// RFQ (Request for Quotation) API Routes

import { Hono } from 'hono'
import { z } from 'zod'
import { query, queryOne, insert, update, generateReferenceNumber, formatDate } from '../lib/db'
import { authMiddleware, requireRole } from '../middleware/auth'
import type { Bindings, RFQ, RFQItem, APIResponse, JWTPayload } from '../types'

const rfqs = new Hono<{ Bindings: Bindings }>()

// All RFQ routes require authentication
rfqs.use('*', authMiddleware)

// Validation schemas
const createRFQSchema = z.object({
  title: z.string().min(5),
  title_ar: z.string().optional(),
  description: z.string().optional(),
  delivery_address: z.string().min(10),
  delivery_address_ar: z.string().optional(),
  required_delivery_date: z.string().optional(),
  items: z.array(z.object({
    item_name: z.string().min(2),
    item_name_ar: z.string().optional(),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    unit_ar: z.string().optional(),
    brand: z.string().optional(),
    brand_ar: z.string().optional(),
    specifications: z.string().optional()
  })).min(1)
})

// POST /api/rfqs - Create new RFQ
rfqs.post('/', requireRole('buyer'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const body = await c.req.json()
    const validation = createRFQSchema.safeParse(body)
    
    if (!validation.success) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid input: ' + validation.error.message,
        error_ar: 'بيانات غير صحيحة'
      }, 400)
    }
    
    const data = validation.data
    const db = c.env.DB
    
    // Get buyer profile
    const buyerProfile = await queryOne<{ id: number }>(
      db,
      'SELECT id FROM buyer_profiles WHERE user_id = ?',
      [user.userId]
    )
    
    if (!buyerProfile) {
      return c.json<APIResponse>({
        success: false,
        error: 'Buyer profile not found',
        error_ar: 'ملف المشتري غير موجود'
      }, 404)
    }
    
    // Generate RFQ number
    const rfqNumber = generateReferenceNumber('RFQ')
    
    // Create RFQ
    const rfqResult = await insert(db, 'rfqs', {
      rfq_number: rfqNumber,
      buyer_id: user.userId,
      buyer_profile_id: buyerProfile.id,
      title: data.title,
      title_ar: data.title_ar || null,
      description: data.description || null,
      delivery_address: data.delivery_address,
      delivery_address_ar: data.delivery_address_ar || null,
      required_delivery_date: data.required_delivery_date || null,
      status: 'draft',
      upload_type: 'manual',
      total_items: data.items.length
    })
    
    if (!rfqResult.success || !rfqResult.lastRowId) {
      throw new Error('Failed to create RFQ')
    }
    
    const rfqId = rfqResult.lastRowId
    
    // Insert RFQ items
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i]
      await insert(db, 'rfq_items', {
        rfq_id: rfqId,
        item_name: item.item_name,
        item_name_ar: item.item_name_ar || null,
        quantity: item.quantity,
        unit: item.unit,
        unit_ar: item.unit_ar || null,
        brand: item.brand || null,
        brand_ar: item.brand_ar || null,
        specifications: item.specifications || null,
        line_number: i + 1
      })
    }
    
    return c.json<APIResponse>({
      success: true,
      message: 'RFQ created successfully',
      message_ar: 'تم إنشاء طلب العرض بنجاح',
      data: {
        rfq_id: rfqId,
        rfq_number: rfqNumber
      }
    }, 201)
    
  } catch (error: any) {
    console.error('RFQ creation error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to create RFQ',
      error_ar: 'فشل في إنشاء طلب العرض'
    }, 500)
  }
})

// GET /api/rfqs - List buyer's RFQs
rfqs.get('/', requireRole('buyer'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const { status, page = '1', limit = '20' } = c.req.query()
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    let sql = `
      SELECT r.*, 
        (SELECT COUNT(*) FROM rfq_items WHERE rfq_id = r.id) as item_count
      FROM rfqs r
      WHERE r.buyer_id = ?
    `
    const params: any[] = [user.userId]
    
    if (status) {
      sql += ` AND r.status = ?`
      params.push(status)
    }
    
    // Count total
    const countResult = await query<{ count: number }>(
      c.env.DB,
      sql.replace('SELECT r.*, (SELECT COUNT(*) FROM rfq_items WHERE rfq_id = r.id) as item_count', 'SELECT COUNT(*) as count'),
      params
    )
    const total = countResult.results?.[0]?.count || 0
    
    sql += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`
    params.push(limitNum, offset)
    
    const result = await query<RFQ>(c.env.DB, sql, params)
    
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
    console.error('RFQ list error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch RFQs',
      error_ar: 'فشل في جلب طلبات العروض'
    }, 500)
  }
})

// GET /api/rfqs/:id - Get RFQ details with items
rfqs.get('/:id', requireRole('buyer'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const id = c.req.param('id')
    const db = c.env.DB
    
    // Get RFQ
    const rfq = await queryOne<RFQ>(
      db,
      'SELECT * FROM rfqs WHERE id = ? AND buyer_id = ?',
      [id, user.userId]
    )
    
    if (!rfq) {
      return c.json<APIResponse>({
        success: false,
        error: 'RFQ not found',
        error_ar: 'طلب العرض غير موجود'
      }, 404)
    }
    
    // Get items
    const itemsResult = await query<RFQItem>(
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

// POST /api/rfqs/:id/submit - Submit RFQ for processing
rfqs.post('/:id/submit', requireRole('buyer'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const id = c.req.param('id')
    const db = c.env.DB
    
    // Verify ownership
    const rfq = await queryOne<RFQ>(
      db,
      'SELECT * FROM rfqs WHERE id = ? AND buyer_id = ?',
      [id, user.userId]
    )
    
    if (!rfq) {
      return c.json<APIResponse>({
        success: false,
        error: 'RFQ not found',
        error_ar: 'طلب العرض غير موجود'
      }, 404)
    }
    
    if (rfq.status !== 'draft') {
      return c.json<APIResponse>({
        success: false,
        error: 'RFQ already submitted',
        error_ar: 'تم إرسال طلب العرض بالفعل'
      }, 400)
    }
    
    // Update status
    await update(db, 'rfqs', 
      { 
        status: 'submitted',
        submitted_at: new Date().toISOString()
      },
      { id: parseInt(id) }
    )
    
    return c.json<APIResponse>({
      success: true,
      message: 'RFQ submitted successfully',
      message_ar: 'تم إرسال طلب العرض بنجاح'
    })
  } catch (error: any) {
    console.error('RFQ submit error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to submit RFQ',
      error_ar: 'فشل في إرسال طلب العرض'
    }, 500)
  }
})

export default rfqs
