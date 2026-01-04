// JWT Utilities for Cloudflare Workers
// Using Web Crypto API (no Node.js dependencies)

import type { JWTPayload } from '../types'

// Simple JWT implementation for Cloudflare Workers
export async function signJWT(payload: JWTPayload, secret: string, expiresIn: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  
  // Parse expiry (e.g., '7d' -> 7 days in milliseconds)
  const expiryMs = parseExpiry(expiresIn)
  const exp = Math.floor((Date.now() + expiryMs) / 1000)
  
  const jwtPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp
  }
  
  const headerBase64 = base64urlEncode(JSON.stringify(header))
  const payloadBase64 = base64urlEncode(JSON.stringify(jwtPayload))
  const message = `${headerBase64}.${payloadBase64}`
  
  const signature = await signMessage(message, secret)
  return `${message}.${signature}`
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.')
    if (!headerB64 || !payloadB64 || !signatureB64) return null
    
    const message = `${headerB64}.${payloadB64}`
    const expectedSignature = await signMessage(message, secret)
    
    if (signatureB64 !== expectedSignature) return null
    
    const payload = JSON.parse(base64urlDecode(payloadB64))
    
    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null // Token expired
    }
    
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

// Helper: Sign message with HMAC-SHA256
async function signMessage(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  return base64urlEncode(signature)
}

// Helper: Base64 URL encode
function base64urlEncode(data: string | ArrayBuffer): string {
  const bytes = typeof data === 'string' 
    ? new TextEncoder().encode(data)
    : new Uint8Array(data)
  
  const base64 = btoa(String.fromCharCode(...bytes))
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Helper: Base64 URL decode
function base64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  
  return new TextDecoder().decode(bytes)
}

// Helper: Parse expiry string (e.g., '7d', '24h', '60m')
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([dhms])$/)
  if (!match) return 7 * 24 * 60 * 60 * 1000 // Default: 7 days
  
  const value = parseInt(match[1], 10)
  const unit = match[2]
  
  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000
    case 'h': return value * 60 * 60 * 1000
    case 'm': return value * 60 * 1000
    case 's': return value * 1000
    default: return 7 * 24 * 60 * 60 * 1000
  }
}

// Helper: Hash password using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Helper: Compare password (simple comparison, in production use bcrypt)
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Note: For production, consider using a proper bcrypt implementation
// For now, we'll use simple SHA-256 hashing for compatibility
