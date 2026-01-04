// Products API Routes

import { Hono } from 'hono'
import { z } from 'zod'
import { query, queryOne } from '../lib/db'
import type { Bindings, Product, Category, APIResponse } from '../types'

const products = new Hono<{ Bindings: Bindings }>()

// GET /api/products - List all products with optional filters
products.get('/', async (c) => {
  try {
    const { category, search, page = '1', limit = '20' } = c.req.query()
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    let sql = `
      SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `
    const params: any[] = []
    
    // Filter by category
    if (category) {
      sql += ` AND p.category_id = ?`
      params.push(parseInt(category))
    }
    
    // Search by name (bilingual)
    if (search) {
      sql += ` AND (p.name LIKE ? OR p.name_ar LIKE ? OR p.sku LIKE ?)`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    // Count total
    const countResult = await query<{ count: number }>(
      c.env.DB,
      sql.replace('SELECT p.*, c.name as category_name, c.name_ar as category_name_ar', 'SELECT COUNT(*) as count'),
      params
    )
    const total = countResult.results?.[0]?.count || 0
    
    // Add pagination
    sql += ` ORDER BY p.name ASC LIMIT ? OFFSET ?`
    params.push(limitNum, offset)
    
    const result = await query<Product>(c.env.DB, sql, params)
    
    return c.json<APIResponse>({
      success: true,
      data: {
        products: result.results || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error: any) {
    console.error('Products list error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch products',
      error_ar: 'فشل في جلب المنتجات'
    }, 500)
  }
})

// GET /api/products/:id - Get single product
products.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const product = await queryOne<Product>(
      c.env.DB,
      `
        SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.is_active = 1
      `,
      [id]
    )
    
    if (!product) {
      return c.json<APIResponse>({
        success: false,
        error: 'Product not found',
        error_ar: 'المنتج غير موجود'
      }, 404)
    }
    
    return c.json<APIResponse>({
      success: true,
      data: { product }
    })
  } catch (error: any) {
    console.error('Product fetch error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch product',
      error_ar: 'فشل في جلب المنتج'
    }, 500)
  }
})

// GET /api/products/categories - List all categories
products.get('/categories/list', async (c) => {
  try {
    const result = await query<Category>(
      c.env.DB,
      `
        SELECT c.*, 
          (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as product_count
        FROM categories c
        WHERE c.is_active = 1
        ORDER BY c.name ASC
      `
    )
    
    return c.json<APIResponse>({
      success: true,
      data: {
        categories: result.results || []
      }
    })
  } catch (error: any) {
    console.error('Categories fetch error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch categories',
      error_ar: 'فشل في جلب الفئات'
    }, 500)
  }
})

// GET /api/products/category/:slug - Get products by category slug
products.get('/category/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')
    const { page = '1', limit = '20' } = c.req.query()
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    // Get category
    const category = await queryOne<Category>(
      c.env.DB,
      'SELECT * FROM categories WHERE slug = ? AND is_active = 1',
      [slug]
    )
    
    if (!category) {
      return c.json<APIResponse>({
        success: false,
        error: 'Category not found',
        error_ar: 'الفئة غير موجودة'
      }, 404)
    }
    
    // Get products
    const countResult = await query<{ count: number }>(
      c.env.DB,
      'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1',
      [category.id]
    )
    const total = countResult.results?.[0]?.count || 0
    
    const result = await query<Product>(
      c.env.DB,
      `
        SELECT * FROM products 
        WHERE category_id = ? AND is_active = 1
        ORDER BY name ASC
        LIMIT ? OFFSET ?
      `,
      [category.id, limitNum, offset]
    )
    
    return c.json<APIResponse>({
      success: true,
      data: {
        category,
        products: result.results || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error: any) {
    console.error('Category products fetch error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'Failed to fetch category products',
      error_ar: 'فشل في جلب منتجات الفئة'
    }, 500)
  }
})

export default products
