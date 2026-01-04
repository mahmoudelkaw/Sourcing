/**
 * Authentication Routes
 * 
 * Handles user authentication, registration, and profile management.
 * Supports three user roles: buyer, vendor, and admin.
 * 
 * Endpoints:
 * - POST /api/auth/login - User login with email/password
 * - POST /api/auth/register/buyer - Buyer registration
 * - POST /api/auth/register/vendor - Vendor registration  
 * - GET /api/auth/me - Get current user profile (protected)
 * 
 * Security:
 * - Passwords are hashed using SHA-256
 * - JWT tokens are used for authentication (7-day expiry)
 * - All registrations start with 'pending' status and require admin approval
 * - Tax IDs must be unique per role
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { signJWT, hashPassword, comparePassword } from '../lib/jwt'
import { query, queryOne, insert } from '../lib/db'
import type { Bindings, User, BuyerProfile, VendorProfile, APIResponse } from '../types'

const auth = new Hono<{ Bindings: Bindings }>()

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Login validation schema
 * - Email must be valid format
 * - Password must be at least 6 characters
 */
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

/**
 * Buyer registration validation schema
 * - All fields support bilingual input (English + Arabic)
 * - Tax ID must be unique and at least 5 characters
 * - Phone must be at least 10 characters
 * - Address must be at least 10 characters
 */
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

/**
 * Vendor registration validation schema
 * - Same as buyer schema plus optional categories array
 * - Categories are stored as JSON string in database
 */
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

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * POST /api/auth/login
 * 
 * Authenticate user and return JWT token
 * 
 * Request Body:
 * {
 *   email: string,
 *   password: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Login successful",
 *   data: {
 *     token: string (JWT),
 *     user: { id, email, role, status },
 *     profile: { ... } (buyer or vendor profile)
 *   }
 * }
 * 
 * Error Responses:
 * - 400: Invalid input
 * - 401: Invalid credentials
 * - 403: Account not active
 * - 500: Server error
 */
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

/**
 * POST /api/auth/register/buyer
 * 
 * Register a new buyer account
 * 
 * Request Body:
 * {
 *   email: string,
 *   password: string (min 6 chars),
 *   company_name: string,
 *   company_name_ar?: string,
 *   tax_id: string (min 5 chars, must be unique),
 *   address: string (min 10 chars),
 *   address_ar?: string,
 *   city: string,
 *   city_ar?: string,
 *   contact_person: string,
 *   contact_person_ar?: string,
 *   phone: string (min 10 chars)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Buyer registration successful. Awaiting admin approval.",
 *   data: { userId, email, status: "pending" }
 * }
 * 
 * Error Responses:
 * - 400: Invalid input
 * - 409: Email or Tax ID already registered
 * - 500: Server error
 */
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

/**
 * POST /api/auth/register/vendor
 * 
 * Register a new vendor account
 * 
 * Request Body: (same as buyer + categories)
 * {
 *   ...buyer fields,
 *   categories?: string[] (e.g., ["Office Supplies", "Electronics"])
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Vendor registration successful. Awaiting admin approval.",
 *   data: { userId, email, status: "pending" }
 * }
 * 
 * Error Responses:
 * - 400: Invalid input
 * - 409: Email or Tax ID already registered
 * - 500: Server error
 */
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

/**
 * GET /api/auth/me
 * 
 * Get current authenticated user's profile
 * This endpoint is protected and requires a valid JWT token in Authorization header
 * 
 * Headers:
 * Authorization: Bearer <jwt_token>
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     user: { id, email, role, status, created_at },
 *     profile: { ... } (buyer or vendor profile)
 *   }
 * }
 * 
 * Error Responses:
 * - 401: Not authenticated or invalid token
 * - 404: User not found
 */
auth.get('/me', async (c) => {
  // This endpoint is called after authMiddleware sets user in context
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
