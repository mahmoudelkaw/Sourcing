// Authentication Routes

import { Hono } from 'hono'
import { z } from 'zod'
import { signJWT, hashPassword, comparePassword } from '../lib/jwt'
import { query, queryOne, insert } from '../lib/db'
import type { Bindings, User, BuyerProfile, VendorProfile, APIResponse } from '../types'

const auth = new Hono<{ Bindings: Bindings }>()

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const registerBuyerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  company_name: z.string().min(2),
  company_name_ar: z.string().optional(),
  tax_id: z.string().min(5),
  address: z.string().min(10),
  address_ar: z.string().optional(),
  city: z.string().min(2),
  city_ar: z.string().optional(),
  contact_person: z.string().min(2),
  contact_person_ar: z.string().optional(),
  phone: z.string().min(10)
})

const registerVendorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  company_name: z.string().min(2),
  company_name_ar: z.string().optional(),
  tax_id: z.string().min(5),
  address: z.string().min(10),
  address_ar: z.string().optional(),
  city: z.string().min(2),
  city_ar: z.string().optional(),
  contact_person: z.string().min(2),
  contact_person_ar: z.string().optional(),
  phone: z.string().min(10),
  categories: z.array(z.string()).optional()
})

// POST /api/auth/login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const validation = loginSchema.safeParse(body)
    
    if (!validation.success) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid input',
        error_ar: 'بيانات غير صحيحة'
      }, 400)
    }
    
    const { email, password } = validation.data
    const db = c.env.DB
    
    // Find user by email
    const user = await queryOne<User>(
      db,
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    
    if (!user) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid credentials',
        error_ar: 'بيانات تسجيل دخول غير صحيحة'
      }, 401)
    }
    
    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash)
    
    if (!passwordMatch) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid credentials',
        error_ar: 'بيانات تسجيل دخول غير صحيحة'
      }, 401)
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return c.json<APIResponse>({
        success: false,
        error: `Account status: ${user.status}. Please contact support.`,
        error_ar: `حالة الحساب: ${user.status}. يرجى الاتصال بالدعم.`
      }, 403)
    }
    
    // Get profile based on role
    let profile: any = null
    if (user.role === 'buyer') {
      profile = await queryOne<BuyerProfile>(
        db,
        'SELECT * FROM buyer_profiles WHERE user_id = ?',
        [user.id]
      )
    } else if (user.role === 'vendor') {
      profile = await queryOne<VendorProfile>(
        db,
        'SELECT * FROM vendor_profiles WHERE user_id = ?',
        [user.id]
      )
    }
    
    // Generate JWT token
    const token = await signJWT(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      c.env.JWT_SECRET,
      c.env.JWT_EXPIRY || '7d'
    )
    
    return c.json<APIResponse>({
      success: true,
      message: 'Login successful',
      message_ar: 'تم تسجيل الدخول بنجاح',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status
        },
        profile
      }
    })
    
  } catch (error: any) {
    console.error('Login error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'An error occurred during login',
      error_ar: 'حدث خطأ أثناء تسجيل الدخول'
    }, 500)
  }
})

// POST /api/auth/register/buyer
auth.post('/register/buyer', async (c) => {
  try {
    const body = await c.req.json()
    const validation = registerBuyerSchema.safeParse(body)
    
    if (!validation.success) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid input: ' + validation.error.message,
        error_ar: 'بيانات غير صحيحة'
      }, 400)
    }
    
    const data = validation.data
    const db = c.env.DB
    
    // Check if email exists
    const existingUser = await queryOne<User>(
      db,
      'SELECT id FROM users WHERE email = ?',
      [data.email]
    )
    
    if (existingUser) {
      return c.json<APIResponse>({
        success: false,
        error: 'Email already registered',
        error_ar: 'البريد الإلكتروني مسجل بالفعل'
      }, 409)
    }
    
    // Check if tax_id exists
    const existingTaxId = await queryOne(
      db,
      'SELECT id FROM buyer_profiles WHERE tax_id = ?',
      [data.tax_id]
    )
    
    if (existingTaxId) {
      return c.json<APIResponse>({
        success: false,
        error: 'Tax ID already registered',
        error_ar: 'الرقم الضريبي مسجل بالفعل'
      }, 409)
    }
    
    // Hash password
    const passwordHash = await hashPassword(data.password)
    
    // Insert user
    const userResult = await insert(db, 'users', {
      email: data.email,
      password_hash: passwordHash,
      role: 'buyer',
      status: 'pending'
    })
    
    if (!userResult.success || !userResult.lastRowId) {
      throw new Error('Failed to create user')
    }
    
    const userId = userResult.lastRowId
    
    // Insert buyer profile
    const profileResult = await insert(db, 'buyer_profiles', {
      user_id: userId,
      company_name: data.company_name,
      company_name_ar: data.company_name_ar || null,
      tax_id: data.tax_id,
      address: data.address,
      address_ar: data.address_ar || null,
      city: data.city,
      city_ar: data.city_ar || null,
      contact_person: data.contact_person,
      contact_person_ar: data.contact_person_ar || null,
      phone: data.phone
    })
    
    if (!profileResult.success) {
      throw new Error('Failed to create profile')
    }
    
    return c.json<APIResponse>({
      success: true,
      message: 'Buyer registration successful. Awaiting admin approval.',
      message_ar: 'تم التسجيل بنجاح. في انتظار موافقة المسؤول.',
      data: {
        userId,
        email: data.email,
        status: 'pending'
      }
    }, 201)
    
  } catch (error: any) {
    console.error('Registration error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'An error occurred during registration',
      error_ar: 'حدث خطأ أثناء التسجيل'
    }, 500)
  }
})

// POST /api/auth/register/vendor
auth.post('/register/vendor', async (c) => {
  try {
    const body = await c.req.json()
    const validation = registerVendorSchema.safeParse(body)
    
    if (!validation.success) {
      return c.json<APIResponse>({
        success: false,
        error: 'Invalid input: ' + validation.error.message,
        error_ar: 'بيانات غير صحيحة'
      }, 400)
    }
    
    const data = validation.data
    const db = c.env.DB
    
    // Check if email exists
    const existingUser = await queryOne<User>(
      db,
      'SELECT id FROM users WHERE email = ?',
      [data.email]
    )
    
    if (existingUser) {
      return c.json<APIResponse>({
        success: false,
        error: 'Email already registered',
        error_ar: 'البريد الإلكتروني مسجل بالفعل'
      }, 409)
    }
    
    // Check if tax_id exists
    const existingTaxId = await queryOne(
      db,
      'SELECT id FROM vendor_profiles WHERE tax_id = ?',
      [data.tax_id]
    )
    
    if (existingTaxId) {
      return c.json<APIResponse>({
        success: false,
        error: 'Tax ID already registered',
        error_ar: 'الرقم الضريبي مسجل بالفعل'
      }, 409)
    }
    
    // Hash password
    const passwordHash = await hashPassword(data.password)
    
    // Insert user
    const userResult = await insert(db, 'users', {
      email: data.email,
      password_hash: passwordHash,
      role: 'vendor',
      status: 'pending'
    })
    
    if (!userResult.success || !userResult.lastRowId) {
      throw new Error('Failed to create user')
    }
    
    const userId = userResult.lastRowId
    
    // Insert vendor profile
    const profileResult = await insert(db, 'vendor_profiles', {
      user_id: userId,
      company_name: data.company_name,
      company_name_ar: data.company_name_ar || null,
      tax_id: data.tax_id,
      address: data.address,
      address_ar: data.address_ar || null,
      city: data.city,
      city_ar: data.city_ar || null,
      contact_person: data.contact_person,
      contact_person_ar: data.contact_person_ar || null,
      phone: data.phone,
      categories: data.categories ? JSON.stringify(data.categories) : null
    })
    
    if (!profileResult.success) {
      throw new Error('Failed to create profile')
    }
    
    return c.json<APIResponse>({
      success: true,
      message: 'Vendor registration successful. Awaiting admin approval.',
      message_ar: 'تم التسجيل بنجاح. في انتظار موافقة المسؤول.',
      data: {
        userId,
        email: data.email,
        status: 'pending'
      }
    }, 201)
    
  } catch (error: any) {
    console.error('Registration error:', error)
    return c.json<APIResponse>({
      success: false,
      error: 'An error occurred during registration',
      error_ar: 'حدث خطأ أثناء التسجيل'
    }, 500)
  }
})

// GET /api/auth/me (protected route)
auth.get('/me', async (c) => {
  // This would be called after authMiddleware
  const user = c.get('user')
  
  if (!user) {
    return c.json<APIResponse>({
      success: false,
      error: 'Not authenticated',
      error_ar: 'غير مصادق'
    }, 401)
  }
  
  const db = c.env.DB
  
  // Get full user data
  const userData = await queryOne<User>(
    db,
    'SELECT id, email, role, status, created_at FROM users WHERE id = ?',
    [user.userId]
  )
  
  if (!userData) {
    return c.json<APIResponse>({
      success: false,
      error: 'User not found',
      error_ar: 'المستخدم غير موجود'
    }, 404)
  }
  
  // Get profile
  let profile: any = null
  if (userData.role === 'buyer') {
    profile = await queryOne<BuyerProfile>(
      db,
      'SELECT * FROM buyer_profiles WHERE user_id = ?',
      [userData.id]
    )
  } else if (userData.role === 'vendor') {
    profile = await queryOne<VendorProfile>(
      db,
      'SELECT * FROM vendor_profiles WHERE user_id = ?',
      [userData.id]
    )
  }
  
  return c.json<APIResponse>({
    success: true,
    data: {
      user: userData,
      profile
    }
  })
})

export default auth
