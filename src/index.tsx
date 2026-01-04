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
import buyerPagesRoutes from './routes/buyer-pages'
import vendorPagesRoutes from './routes/vendor-pages'
import adminPagesRoutes from './routes/admin-pages'
import registerPagesRoutes from './routes/register-pages'
import { authMiddleware } from './middleware/auth'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// SEO files (robots.txt and sitemap.xml) - serve from root
app.get('/robots.txt', (c) => {
  return c.text(`# Lesorce B2B Platform - Robots.txt
# Allow all search engines

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /buyer/
Disallow: /vendor/
Disallow: /api/

# Sitemap location
Sitemap: ${c.env.APP_URL || 'https://sourssing.com'}/sitemap.xml
`, 200, { 'Content-Type': 'text/plain' })
})

app.get('/sitemap.xml', (c) => {
  const baseUrl = c.env.APP_URL || 'https://lesorce.com'
  return c.text(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Homepage (Bilingual) -->
  <url>
    <loc>${baseUrl}/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/?lang=en"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/?lang=ar"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/"/>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <lastmod>2026-01-04</lastmod>
  </url>
  
  <!-- Login Page -->
  <url>
    <loc>${baseUrl}/login</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/login?lang=en"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/login?lang=ar"/>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>2026-01-04</lastmod>
  </url>
  
  <!-- Register Pages -->
  <url>
    <loc>${baseUrl}/register?role=buyer</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <lastmod>2026-01-04</lastmod>
  </url>
  
  <url>
    <loc>${baseUrl}/register?role=vendor</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <lastmod>2026-01-04</lastmod>
  </url>
  
  <!-- About Page (Future) -->
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Contact Page (Future) -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`, 200, { 'Content-Type': 'application/xml' })
})

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/products', productsRoutes)
app.route('/api/rfqs', rfqsRoutes)
app.route('/api/bids', bidsRoutes)
app.route('/api/orders', ordersRoutes)
app.route('/api/payments', paymentsRoutes)
app.route('/api/upload', uploadRoutes)
app.route('/api/admin', adminRoutes)

// Portal Pages
app.route('/buyer', buyerPagesRoutes)
app.route('/vendor', vendorPagesRoutes)
app.route('/admin', adminPagesRoutes)
app.route('/register', registerPagesRoutes)

// Protected API example (with auth middleware)
app.get('/api/protected', authMiddleware, (c) => {
  const user = c.get('user')
  return c.json({
    success: true,
    message: 'This is a protected route',
    user
  })
})

// Home page - SEO-optimized bilingual landing page
app.get('/', (c) => {
  // Detect language from Accept-Language header or query param
  const acceptLang = c.req.header('Accept-Language') || ''
  const langParam = c.req.query('lang')
  const isArabic = langParam === 'ar' || (!langParam && acceptLang.includes('ar'))
  
  const lang = isArabic ? 'ar' : 'en'
  const dir = isArabic ? 'rtl' : 'ltr'
  
  const content = isArabic ? {
    title: 'ليسورس | مورد المستلزمات المكتبية ومواد التنظيف للشركات في مصر',
    description: 'مورد متخصص في المستلزمات المكتبية ومواد التنظيف للشركات المصرية. جودة مضمونة، أسعار تنافسية، توصيل سريع. نبسط مشترياتك المكتبية.',
    hero_title: 'مورد المستلزمات المكتبية ومواد التنظيف',
    hero_subtitle: 'كل ما تحتاجه شركتك من أدوات مكتبية ومواد نظافة',
    hero_desc: 'ليسورس متخصصون في توفير المستلزمات المكتبية الكاملة ومواد التنظيف الاحترافية للشركات المصرية. مورد واحد موثوق، جودة مضمونة، وأسعار تنافسية.',
    cta_buyer: 'سجّل كمشتري',
    cta_vendor: 'سجّل كمورد',
    feature1_title: 'مستلزمات مكتبية شاملة',
    feature1_desc: 'أقلام، أوراق، دفاتر، مجلدات، أدوات طباعة وكل احتياجات مكتبك.',
    feature2_title: 'مواد تنظيف احترافية',
    feature2_desc: 'منظفات، مطهرات، مناديل، معطرات وجميع مواد النظافة للشركات.',
    feature3_title: 'توصيل سريع',
    feature3_desc: 'توصيل سريع لطلباتك في القاهرة والجيزة خلال 24-48 ساعة.',
    feature4_title: 'أسعار تنافسية',
    feature4_desc: 'أفضل الأسعار في السوق مع خصومات للطلبات الكبيرة وأسعار الجملة.',
    how_title: 'كيف يعمل',
    how_step1: '1. أنشئ حساب وسجّل شركتك',
    how_step2: '2. تصفح الكتالوج أو أرسل طلب عرض سعر',
    how_step3: '3. احصل على عرض سعر موحد منا',
    how_step4: '4. ادفع بأمان وتتبع طلبك',
    how_step5: '5. استلم منتجات مفحوصة الجودة',
    footer_about: 'عن ليسورس',
    footer_contact: 'اتصل بنا',
    footer_rights: '© 2026 ليسورس. جميع الحقوق محفوظة.',
  } : {
    title: 'Lesorce | Office Supplies & Cleaning Products for Egyptian Businesses',
    description: 'Leading supplier of office stationery and professional cleaning supplies for Egyptian companies. Guaranteed quality, competitive prices, fast delivery. Simplify your office procurement.',
    hero_title: 'Office Supplies & Cleaning Products Supplier',
    hero_subtitle: 'Everything your business needs in stationery and cleaning',
    hero_desc: 'Lesorce specializes in providing complete office stationery and professional cleaning supplies for Egyptian businesses. One trusted supplier, guaranteed quality, and competitive wholesale prices.',
    cta_buyer: 'Register as Buyer',
    cta_vendor: 'Register as Vendor',
    feature1_title: 'Complete Office Stationery',
    feature1_desc: 'Pens, paper, notebooks, folders, printing supplies, and all office essentials.',
    feature2_title: 'Professional Cleaning Supplies',
    feature2_desc: 'Detergents, disinfectants, tissues, air fresheners, and all cleaning materials.',
    feature3_title: 'Fast Delivery',
    feature3_desc: 'Quick delivery in Cairo and Giza within 24-48 hours of ordering.',
    feature4_title: 'Wholesale Pricing',
    feature4_desc: 'Best market prices with bulk discounts and wholesale rates for businesses.',
    how_title: 'How It Works',
    how_step1: '1. Create account and register your company',
    how_step2: '2. Browse catalog or submit RFQ',
    how_step3: '3. Receive consolidated quotation from us',
    how_step4: '4. Pay securely and track your order',
    how_step5: '5. Receive quality-inspected products',
    footer_about: 'About Lesorce',
    footer_contact: 'Contact Us',
    footer_rights: '© 2026 Lesorce. All rights reserved.',
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}" dir="${dir}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <!-- SEO Meta Tags -->
        <title>${content.title}</title>
        <meta name="description" content="${content.description}">
        <meta name="keywords" content="${isArabic ? 'مستلزمات مكتبية, مواد تنظيف, أدوات مكتبية, منظفات, مطهرات, أوراق, أقلام, دفاتر, مصر, شركات' : 'office supplies, cleaning supplies, stationery, detergents, disinfectants, paper, pens, notebooks, Egypt, wholesale'}">
        <meta name="author" content="Lesorce">
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        <link rel="canonical" href="${c.env.APP_URL || 'https://sourssing.com'}${isArabic ? '?lang=ar' : ''}">
        
        <!-- Alternate Language URLs (Hreflang) -->
        <link rel="alternate" hreflang="en" href="${c.env.APP_URL || 'https://sourssing.com'}?lang=en">
        <link rel="alternate" hreflang="ar" href="${c.env.APP_URL || 'https://sourssing.com'}?lang=ar">
        <link rel="alternate" hreflang="x-default" href="${c.env.APP_URL || 'https://sourssing.com'}">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="${c.env.APP_URL || 'https://sourssing.com'}">
        <meta property="og:title" content="${content.title}">
        <meta property="og:description" content="${content.description}">
        <meta property="og:image" content="${c.env.APP_URL}/static/og-image.jpg">
        <meta property="og:locale" content="${isArabic ? 'ar_EG' : 'en_US'}">
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="${c.env.APP_URL || 'https://sourssing.com'}">
        <meta property="twitter:title" content="${content.title}">
        <meta property="twitter:description" content="${content.description}">
        <meta property="twitter:image" content="${c.env.APP_URL}/static/og-image.jpg">
        
        <!-- Schema.org structured data (Organization + WebSite + BreadcrumbList) -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Lesorce",
          "alternateName": "ليسورس",
          "description": "${content.description}",
          "url": "${c.env.APP_URL || 'https://sourssing.com'}",
          "logo": "${c.env.APP_URL}/static/logo.png",
          "foundingDate": "2025",
          "foundingLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "EG",
              "addressLocality": "Egypt"
            }
          },
          "areaServed": {
            "@type": "Country",
            "name": "Egypt"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+20-XXX-XXX-XXXX",
            "contactType": "customer service",
            "areaServed": "EG",
            "availableLanguage": ["English", "Arabic"]
          },
          "sameAs": [
            "https://www.facebook.com/sourssing",
            "https://www.linkedin.com/company/sourssing",
            "https://twitter.com/sourssing"
          ]
        }
        </script>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Lesorce",
          "url": "${c.env.APP_URL || 'https://sourssing.com'}",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "${c.env.APP_URL || 'https://sourssing.com'}/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "inLanguage": ["en", "ar"]
        }
        </script>
        
        <!-- Preload Critical Resources -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="preconnect" href="https://cdn.tailwindcss.com">
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
        
        <!-- Fonts & CSS -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cairo:wght@300;400;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <style>
          ${isArabic ? 'body { font-family: "Cairo", sans-serif; }' : 'body { font-family: "Inter", sans-serif; }'}
          .gradient-bg {
            background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%);
          }
          .animate-fade-in {
            animation: fadeIn 0.6s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .feature-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header/Navigation -->
        <nav class="bg-white shadow-sm fixed w-full top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <i class="fas fa-pen-fancy text-3xl text-sky-600 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}"></i>
                        <span class="text-2xl font-bold text-gray-900">Lesorce</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <a href="?lang=${isArabic ? 'en' : 'ar'}" class="text-gray-600 hover:text-sky-600">
                            <i class="fas fa-language ${dir === 'rtl' ? 'ml-2' : 'mr-2'}"></i>
                            ${isArabic ? 'English' : 'العربية'}
                        </a>
                        <a href="/login" class="text-gray-600 hover:text-sky-600 font-medium">
                            ${isArabic ? 'تسجيل الدخول' : 'Login'}
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="gradient-bg text-white pt-32 pb-20 px-4">
            <div class="max-w-7xl mx-auto text-center animate-fade-in">
                <h1 class="text-5xl md:text-6xl font-bold mb-6">
                    ${content.hero_title}
                </h1>
                <p class="text-2xl md:text-3xl mb-4 font-light">
                    ${content.hero_subtitle}
                </p>
                <p class="text-lg md:text-xl mb-12 max-w-3xl mx-auto opacity-90">
                    ${content.hero_desc}
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/register?role=buyer" 
                       class="bg-white text-sky-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg">
                        <i class="fas fa-building ${dir === 'rtl' ? 'ml-2' : 'mr-2'}"></i>
                        ${content.cta_buyer}
                    </a>
                    <a href="/register?role=vendor" 
                       class="bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-emerald-700 transition shadow-lg">
                        <i class="fas fa-truck ${dir === 'rtl' ? 'ml-2' : 'mr-2'}"></i>
                        ${content.cta_vendor}
                    </a>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="py-20 px-4">
            <div class="max-w-7xl mx-auto">
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div class="feature-card bg-white p-8 rounded-xl shadow-md">
                        <div class="text-sky-600 text-4xl mb-4">
                            <i class="fas fa-pen"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-gray-900">${content.feature1_title}</h3>
                        <p class="text-gray-600">${content.feature1_desc}</p>
                    </div>
                    <div class="feature-card bg-white p-8 rounded-xl shadow-md">
                        <div class="text-emerald-600 text-4xl mb-4">
                            <i class="fas fa-spray-can"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-gray-900">${content.feature2_title}</h3>
                        <p class="text-gray-600">${content.feature2_desc}</p>
                    </div>
                    <div class="feature-card bg-white p-8 rounded-xl shadow-md">
                        <div class="text-sky-600 text-4xl mb-4">
                            <i class="fas fa-truck-fast"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-gray-900">${content.feature3_title}</h3>
                        <p class="text-gray-600">${content.feature3_desc}</p>
                    </div>
                    <div class="feature-card bg-white p-8 rounded-xl shadow-md">
                        <div class="text-emerald-600 text-4xl mb-4">
                            <i class="fas fa-tags"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-gray-900">${content.feature4_title}</h3>
                        <p class="text-gray-600">${content.feature4_desc}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- How It Works Section -->
        <section class="py-20 px-4 bg-white">
            <div class="max-w-5xl mx-auto">
                <h2 class="text-4xl font-bold text-center mb-16 text-gray-900">
                    ${content.how_title}
                </h2>
                <div class="space-y-8">
                    <div class="flex items-center gap-6">
                        <div class="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                            1
                        </div>
                        <p class="text-lg text-gray-700">${content.how_step1}</p>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                            2
                        </div>
                        <p class="text-lg text-gray-700">${content.how_step2}</p>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                            3
                        </div>
                        <p class="text-lg text-gray-700">${content.how_step3}</p>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                            4
                        </div>
                        <p class="text-lg text-gray-700">${content.how_step4}</p>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                            5
                        </div>
                        <p class="text-lg text-gray-700">${content.how_step5}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white py-12 px-4">
            <div class="max-w-7xl mx-auto text-center">
                <div class="mb-8">
                    <i class="fas fa-layer-group text-4xl text-purple-400 mb-4"></i>
                    <p class="text-2xl font-bold">Lesorce</p>
                </div>
                <div class="flex justify-center gap-8 mb-8">
                    <a href="/about" class="hover:text-purple-400 transition">${content.footer_about}</a>
                    <a href="/contact" class="hover:text-purple-400 transition">${content.footer_contact}</a>
                </div>
                <p class="text-gray-400">${content.footer_rights}</p>
            </div>
        </footer>

        <script>
          // Language toggle persistence
          const currentLang = '${lang}';
          localStorage.setItem('preferred_lang', currentLang);
        </script>
    </body>
    </html>
  `)
})

// Login page
app.get('/login', (c) => {
  const langParam = c.req.query('lang')
  const isArabic = langParam === 'ar'
  return c.html(`
    <!DOCTYPE html>
    <html lang="${isArabic ? 'ar' : 'en'}" dir="${isArabic ? 'rtl' : 'ltr'}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isArabic ? 'تسجيل الدخول - ليسورس' : 'Login - Lesorce'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          ${isArabic ? 'body { font-family: "Cairo", sans-serif; }' : 'body { font-family: "Inter", sans-serif; }'}
        </style>
    </head>
    <body class="bg-gray-100">
        <div class="min-h-screen flex items-center justify-center px-4">
            <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div class="text-center mb-8">
                    <i class="fas fa-layer-group text-5xl text-purple-600 mb-4"></i>
                    <h2 class="text-3xl font-bold text-gray-900">${isArabic ? 'تسجيل الدخول' : 'Login'}</h2>
                </div>
                
                <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"></div>
                
                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block text-gray-700 mb-2">${isArabic ? 'البريد الإلكتروني' : 'Email'}</label>
                        <input type="email" name="email" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                               placeholder="${isArabic ? 'name@company.com' : 'name@company.com'}">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2">${isArabic ? 'كلمة المرور' : 'Password'}</label>
                        <input type="password" name="password" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                               placeholder="${isArabic ? '••••••••' : '••••••••'}">
                    </div>
                    
                    <button type="submit" 
                            class="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                        ${isArabic ? 'تسجيل الدخول' : 'Login'}
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        ${isArabic ? 'ليس لديك حساب؟' : "Don't have an account?"}
                        <a href="/register" class="text-purple-600 hover:underline font-medium">
                            ${isArabic ? 'سجّل الآن' : 'Register now'}
                        </a>
                    </p>
                </div>
                
                <div class="mt-4 text-center">
                    <a href="/" class="text-gray-500 hover:text-purple-600">
                        <i class="fas fa-arrow-${isArabic ? 'right' : 'left'}"></i>
                        ${isArabic ? 'العودة للرئيسية' : 'Back to home'}
                    </a>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
              email: formData.get('email'),
              password: formData.get('password')
            };
            
            try {
              const response = await axios.post('/api/auth/login', data);
              if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                
                // Redirect based on role
                const role = response.data.data.user.role;
                if (role === 'buyer') window.location.href = '/buyer/dashboard';
                else if (role === 'vendor') window.location.href = '/vendor/dashboard';
                else if (role === 'admin') window.location.href = '/admin/dashboard';
              }
            } catch (error) {
              const errorMsg = error.response?.data?.error || 'Login failed';
              document.getElementById('error-message').textContent = errorMsg;
              document.getElementById('error-message').classList.remove('hidden');
            }
          });
        </script>
    </body>
    </html>
  `)
})

// Register page placeholder (will be expanded)
app.get('/register', (c) => {
  const role = c.req.query('role') || 'buyer'
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Register - Lesorce</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
        <div class="min-h-screen flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
                <h2 class="text-3xl font-bold mb-6">Register as ${role === 'buyer' ? 'Buyer' : 'Vendor'}</h2>
                <p class="text-gray-600 mb-4">Full registration form will be implemented...</p>
                <a href="/" class="text-purple-600 hover:underline">← Back to home</a>
            </div>
        </div>
    </body>
    </html>
  `)
})

// Buyer Dashboard
app.get('/buyer/dashboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Buyer Dashboard - Lesorce</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body { font-family: "Inter", sans-serif; }
          .nav-link.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Top Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-layer-group text-2xl text-purple-600"></i>
                        <span class="text-xl font-bold text-gray-900">Lesorce</span>
                        <span class="text-sm text-gray-500 ml-2">| Buyer Portal</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <button onclick="toggleLanguage()" class="text-gray-600 hover:text-purple-600">
                            <i class="fas fa-language mr-2"></i>
                            <span id="lang-toggle">العربية</span>
                        </button>
                        <div class="relative">
                            <button onclick="toggleUserMenu()" class="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                                <i class="fas fa-user-circle text-2xl"></i>
                                <span id="user-name">Loading...</span>
                                <i class="fas fa-chevron-down text-xs"></i>
                            </button>
                            <div id="user-menu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    <i class="fas fa-user mr-2"></i>Profile
                                </a>
                                <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    <i class="fas fa-cog mr-2"></i>Settings
                                </a>
                                <hr class="my-2">
                                <a href="#" onclick="logout()" class="block px-4 py-2 text-red-600 hover:bg-gray-100">
                                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="flex h-screen">
            <!-- Sidebar -->
            <aside class="w-64 bg-white border-r border-gray-200 overflow-y-auto">
                <nav class="p-4 space-y-2">
                    <a href="/buyer/dashboard" class="nav-link active flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-home w-5"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="/buyer/catalog" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-th-large w-5"></i>
                        <span>Product Catalog</span>
                    </a>
                    <a href="/buyer/rfq/create" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-plus-circle w-5"></i>
                        <span>Create RFQ</span>
                    </a>
                    <a href="/buyer/rfqs" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-file-alt w-5"></i>
                        <span>My RFQs</span>
                    </a>
                    <a href="/buyer/quotations" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-file-invoice-dollar w-5"></i>
                        <span>Quotations</span>
                    </a>
                    <a href="/buyer/orders" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-shopping-cart w-5"></i>
                        <span>My Orders</span>
                    </a>
                    <a href="/buyer/buy-again" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-redo w-5"></i>
                        <span>Buy Again</span>
                    </a>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 overflow-y-auto p-8">
                <!-- Dashboard Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p class="text-gray-600">Welcome back! Here's what's happening with your orders.</p>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">Total RFQs</p>
                                <p class="text-3xl font-bold text-gray-900" id="stat-rfqs">0</p>
                            </div>
                            <div class="bg-purple-100 p-3 rounded-lg">
                                <i class="fas fa-file-alt text-purple-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">Pending Quotations</p>
                                <p class="text-3xl font-bold text-gray-900" id="stat-quotations">0</p>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-lg">
                                <i class="fas fa-file-invoice-dollar text-blue-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">Active Orders</p>
                                <p class="text-3xl font-bold text-gray-900" id="stat-orders">0</p>
                            </div>
                            <div class="bg-green-100 p-3 rounded-lg">
                                <i class="fas fa-shopping-cart text-green-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">Total Spent</p>
                                <p class="text-3xl font-bold text-gray-900" id="stat-spent">EGP 0</p>
                            </div>
                            <div class="bg-yellow-100 p-3 rounded-lg">
                                <i class="fas fa-money-bill-wave text-yellow-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent RFQs -->
                <div class="bg-white rounded-lg shadow mb-8">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h2 class="text-xl font-bold text-gray-900">Recent RFQs</h2>
                            <a href="/buyer/rfqs" class="text-purple-600 hover:text-purple-700 font-medium">
                                View All <i class="fas fa-arrow-right ml-1"></i>
                            </a>
                        </div>
                    </div>
                    <div id="recent-rfqs" class="p-6">
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-file-alt text-4xl mb-2"></i>
                            <p>No RFQs yet. Create your first RFQ to get started!</p>
                            <a href="/buyer/rfq/create" class="inline-block mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                                <i class="fas fa-plus mr-2"></i>Create RFQ
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a href="/buyer/catalog" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
                        <i class="fas fa-th-large text-4xl text-purple-600 mb-3"></i>
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Browse Catalog</h3>
                        <p class="text-gray-600 text-sm">Explore our wide range of products</p>
                    </a>
                    
                    <a href="/buyer/rfq/create" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
                        <i class="fas fa-plus-circle text-4xl text-green-600 mb-3"></i>
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Create RFQ</h3>
                        <p class="text-gray-600 text-sm">Submit a new request for quotation</p>
                    </a>
                    
                    <a href="/buyer/buy-again" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
                        <i class="fas fa-redo text-4xl text-blue-600 mb-3"></i>
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Buy Again</h3>
                        <p class="text-gray-600 text-sm">Reorder your frequently purchased items</p>
                    </a>
                </div>
            </main>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          // Check authentication
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          if (!token || user.role !== 'buyer') {
            window.location.href = '/login';
          }
          
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
          
          // Display user name
          axios.get('/api/auth/me')
            .then(response => {
              if (response.data.success) {
                const profile = response.data.data.profile;
                document.getElementById('user-name').textContent = profile?.contact_person || user.email;
              }
            })
            .catch(error => {
              console.error('Failed to load user profile');
            });
          
          // Load dashboard stats
          function loadStats() {
            axios.get('/api/rfqs')
              .then(response => {
                if (response.data.success) {
                  document.getElementById('stat-rfqs').textContent = response.data.data.pagination.total;
                }
              })
              .catch(error => console.error('Failed to load stats'));
          }
          
          loadStats();
          
          // Toggle user menu
          function toggleUserMenu() {
            document.getElementById('user-menu').classList.toggle('hidden');
          }
          
          // Close menu when clicking outside
          document.addEventListener('click', (e) => {
            const menu = document.getElementById('user-menu');
            const button = event.target.closest('button[onclick="toggleUserMenu()"]');
            if (!button && !menu.contains(event.target)) {
              menu.classList.add('hidden');
            }
          });
          
          // Logout
          function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          
          // Language toggle
          function toggleLanguage() {
            // TODO: Implement language switching
            alert('Language switching will be implemented');
          }
        </script>
    </body>
    </html>
  `)
})

export default app
