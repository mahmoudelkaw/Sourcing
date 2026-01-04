// File Upload and OCR API Routes

import { Hono } from 'hono'
import { z } from 'zod'
import { query, insert, generateReferenceNumber } from '../lib/db'
import { authMiddleware, requireRole } from '../middleware/auth'
import type { Bindings, APIResponse, JWTPayload } from '../types'

const upload = new Hono<{ Bindings: Bindings }>()

// All upload routes require authentication
upload.use('*', authMiddleware)

// POST /api/upload/ocr - Process file with OpenAI Vision OCR
upload.post('/ocr', requireRole('buyer'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const contentType = c.req.header('content-type') || ''
    
    // Check if it's a file upload (multipart/form-data or direct image)
    if (!contentType.includes('multipart/form-data') && !contentType.includes('image/')) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid content type. Expected image or form data',
        error_ar: 'نوع محتوى غير صحيح'
      }, 400)
    }

    let fileBuffer: ArrayBuffer
    let fileName: string = 'upload.png'
    let mimeType: string = 'image/png'

    // Handle multipart form data
    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return c.json<APIResponse>({
          success: false,
          error: 'No file provided',
          error_ar: 'لم يتم تقديم ملف'
        }, 400)
      }

      fileName = file.name
      mimeType = file.type
      fileBuffer = await file.arrayBuffer()
    } else {
      // Handle direct image upload
      fileBuffer = await c.req.arrayBuffer()
      mimeType = contentType
    }

    // Validate file size (max 5MB)
    if (fileBuffer.byteLength > 5 * 1024 * 1024) {
      return c.json<APIResponse>({
        success: false,
        error: 'File too large (max 5MB)',
        error_ar: 'الملف كبير جداً (الحد الأقصى 5 ميجابايت)'
      }, 400)
    }

    // Validate file type (images only for OCR)
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validImageTypes.includes(mimeType)) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid file type. Only images (JPEG, PNG, WebP) are supported',
        error_ar: 'نوع ملف غير صحيح. الصور فقط (JPEG، PNG، WebP) مدعومة'
      }, 400)
    }

    // Convert to base64 for OpenAI API
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(fileBuffer))
    )
    const dataUrl = `data:${mimeType};base64,${base64Image}`

    // Call OpenAI Vision API for OCR
    const openaiApiKey = c.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY
    const openaiBaseUrl = c.env.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

    if (!openaiApiKey) {
      return c.json<APIResponse>({
        success: false,
        error: 'OpenAI API key not configured',
        error_ar: 'مفتاح OpenAI API غير مكوّن'
      }, 500)
    }

    const ocrPrompt = `You are an expert at extracting procurement data from images (invoices, purchase orders, quotes, product catalogs).

Analyze this image and extract any procurement-related information in the following JSON format:

{
  "title": "Brief description of what this is (e.g., Office Supplies Order)",
  "items": [
    {
      "item_name": "Product name",
      "quantity": number,
      "unit": "unit type (e.g., pieces, boxes, cartons)",
      "brand": "brand name if visible",
      "specifications": "any specifications or notes"
    }
  ],
  "delivery_address": "delivery address if visible",
  "notes": "any additional notes or observations"
}

If the image contains multiple items, extract all of them. If some fields are not visible, omit them.
Return ONLY valid JSON, no additional text.`

    const openaiResponse = await fetch(`${openaiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: ocrPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      return c.json<APIResponse>({
        success: false,
        error: 'Failed to process image with OCR',
        error_ar: 'فشل في معالجة الصورة'
      }, 500)
    }

    const result = await openaiResponse.json() as any
    const content = result.choices?.[0]?.message?.content

    if (!content) {
      return c.json<APIResponse>({
        success: false,
        error: 'No content extracted from image',
        error_ar: 'لم يتم استخراج أي محتوى من الصورة'
      }, 400)
    }

    // Parse the JSON response
    let extractedData
    try {
      // Remove markdown code blocks if present
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      extractedData = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return c.json<APIResponse>({
        success: false,
        error: 'Failed to parse extracted data',
        error_ar: 'فشل في تحليل البيانات المستخرجة',
        data: {
          raw_content: content
        }
      }, 400)
    }

    return c.json<APIResponse>({
      success: true,
      message: 'Image processed successfully',
      message_ar: 'تم معالجة الصورة بنجاح',
      data: {
        extracted_data: extractedData,
        file_name: fileName,
        file_size: fileBuffer.byteLength,
        mime_type: mimeType
      }
    })

  } catch (error: any) {
    console.error('OCR processing error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to process file: ' + error.message,
      error_ar: 'فشل في معالجة الملف'
    }, 500)
  }
})

// POST /api/upload/create-rfq - Create RFQ from OCR data
upload.post('/create-rfq', requireRole('buyer'), async (c) => {
  try {
    const user = c.get('user') as JWTPayload
    const body = await c.req.json()
    const db = c.env.DB
    
    const { 
      title, 
      title_ar, 
      description,
      delivery_address, 
      delivery_address_ar,
      required_delivery_date,
      items,
      source = 'ocr'
    } = body

    // Validate
    if (!title || !delivery_address || !items || items.length === 0) {
      return c.json<APIResponse>({
        success: false,
        error: 'Missing required fields: title, delivery_address, items',
        error_ar: 'حقول مطلوبة مفقودة'
      }, 400)
    }

    // Get buyer profile
    const buyerProfile = await query<{ id: number }>(
      db,
      'SELECT id FROM buyer_profiles WHERE user_id = ?',
      [user.userId]
    )

    if (!buyerProfile.results || buyerProfile.results.length === 0) {
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
      buyer_profile_id: buyerProfile.results[0].id,
      title: title,
      title_ar: title_ar || null,
      description: description || `Created from ${source}`,
      delivery_address: delivery_address,
      delivery_address_ar: delivery_address_ar || null,
      required_delivery_date: required_delivery_date || null,
      status: 'draft',
      upload_type: source,
      total_items: items.length
    })

    if (!rfqResult.success || !rfqResult.lastRowId) {
      throw new Error('Failed to create RFQ')
    }

    const rfqId = rfqResult.lastRowId

    // Insert RFQ items
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      await insert(db, 'rfq_items', {
        rfq_id: rfqId,
        item_name: item.item_name,
        item_name_ar: item.item_name_ar || null,
        quantity: item.quantity || 1,
        unit: item.unit || 'piece',
        unit_ar: item.unit_ar || null,
        brand: item.brand || null,
        brand_ar: item.brand_ar || null,
        specifications: item.specifications || null,
        line_number: i + 1
      })
    }

    return c.json<APIResponse>({
      success: true,
      message: 'RFQ created successfully from OCR data',
      message_ar: 'تم إنشاء طلب العرض بنجاح',
      data: {
        rfq_id: rfqId,
        rfq_number: rfqNumber,
        items_count: items.length
      }
    }, 201)

  } catch (error: any) {
    console.error('Create RFQ from OCR error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to create RFQ',
      error_ar: 'فشل في إنشاء طلب العرض'
    }, 500)
  }
})

export default upload
