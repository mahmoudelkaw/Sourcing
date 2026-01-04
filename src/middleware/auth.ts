// Authentication Middleware

import { Context, Next } from 'hono'
import { verifyJWT } from '../lib/jwt'
import type { Bindings, JWTPayload } from '../types'

// Extend Context type to include user
export type AuthContext = Context<{ Bindings: Bindings }> & {
  user?: JWTPayload
}

// Middleware: Verify JWT token
export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: 'Unauthorized - No token provided',
      error_ar: 'غير مصرح - لم يتم تقديم رمز المصادقة'
    }, 401)
  }
  
  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  const jwtSecret = c.env.JWT_SECRET
  
  const payload = await verifyJWT(token, jwtSecret)
  
  if (!payload) {
    return c.json({
      success: false,
      error: 'Unauthorized - Invalid or expired token',
      error_ar: 'غير مصرح - رمز غير صالح أو منتهي الصلاحية'
    }, 401)
  }
  
  // Attach user to context
  c.set('user', payload)
  
  await next()
}

// Middleware: Check user role
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const user = c.get('user') as JWTPayload | undefined
    
    if (!user) {
      return c.json({
        success: false,
        error: 'Unauthorized - Authentication required',
        error_ar: 'غير مصرح - المصادقة مطلوبة'
      }, 401)
    }
    
    if (!allowedRoles.includes(user.role)) {
      return c.json({
        success: false,
        error: `Forbidden - Requires role: ${allowedRoles.join(' or ')}`,
        error_ar: `ممنوع - يتطلب صلاحية: ${allowedRoles.join(' أو ')}`
      }, 403)
    }
    
    await next()
  }
}

// Middleware: Check if user is active
export async function requireActiveUser(c: Context<{ Bindings: Bindings }>, next: Next) {
  const user = c.get('user') as JWTPayload | undefined
  
  if (!user) {
    return c.json({
      success: false,
      error: 'Unauthorized',
      error_ar: 'غير مصرح'
    }, 401)
  }
  
  // Check user status in database
  const db = c.env.DB
  const dbUser = await db.prepare('SELECT status FROM users WHERE id = ?')
    .bind(user.userId)
    .first()
  
  if (!dbUser || dbUser.status !== 'active') {
    return c.json({
      success: false,
      error: 'Account is not active. Please contact support.',
      error_ar: 'الحساب غير نشط. يرجى الاتصال بالدعم.'
    }, 403)
  }
  
  await next()
}

// Helper: Get current user from context
export function getCurrentUser(c: Context<{ Bindings: Bindings }>): JWTPayload | null {
  return c.get('user') as JWTPayload || null
}
