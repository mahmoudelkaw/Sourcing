import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import authRoutes from './routes/auth'
import productsRoutes from './routes/products'
import rfqsRoutes from './routes/rfqs'
import bidsRoutes from './routes/bids'
import ordersRoutes from './routes/orders'
import paymentsRoutes from './routes/payments'
import uploadRoutes from './routes/upload'
import adminRoutes from './routes/admin'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('*', cors())

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/products', productsRoutes)
app.route('/api/rfqs', rfqsRoutes)
app.route('/api/bids', bidsRoutes)
app.route('/api/orders', ordersRoutes)
app.route('/api/payments', paymentsRoutes)
app.route('/api/upload', uploadRoutes)
app.route('/api/admin', adminRoutes)

// SEO files
app.get('/robots.txt', (c) => {
  return c.text(`# Lesorce B2B Platform - Robots.txt
User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${c.env.APP_URL || 'https://lesorce.com'}/sitemap.xml`, 200, {
    'Content-Type': 'text/plain',
  })
})

app.get('/sitemap.xml', (c) => {
  const baseUrl = c.env.APP_URL || 'https://lesorce.com'
  return c.text(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`, 200, {
    'Content-Type': 'application/xml',
  })
})

// Serve static assets from client build
app.use('/assets/*', serveStatic({ root: './client' }))

// Serve index.html for all other routes (SPA fallback)
app.get('*', serveStatic({ path: './client/index.html' }))

export default app
