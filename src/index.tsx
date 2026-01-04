import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import authRoutes from './routes/auth'
import { authMiddleware } from './middleware/auth'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes
app.route('/api/auth', authRoutes)

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
    title: 'سورسنج | منصة الشراء B2B للشركات في مصر',
    description: 'منصة شراء احترافية للشركات والمؤسسات. مورد واحد موثوق. جودة مضمونة. فواتير موحدة. نبسط عمليات الشراء للأعمال.',
    hero_title: 'بسّط عمليات الشراء للشركات',
    hero_subtitle: 'مورد واحد. جودة مضمونة. فواتير موحدة.',
    hero_desc: 'سورسنج هي منصة الشراء B2B الرائدة في مصر. نوفر لك مورد واحد موثوق لكل احتياجات شركتك مع ضمان الجودة والتسعير التنافسي.',
    cta_buyer: 'سجّل كمشتري',
    cta_vendor: 'سجّل كمورد',
    feature1_title: 'مورد واحد موثوق',
    feature1_desc: 'لا حاجة للتعامل مع عشرات الموردين. نحن نوفر لك كل ما تحتاجه.',
    feature2_title: 'جودة مضمونة',
    feature2_desc: 'فحص دقيق للجودة في مستودعنا قبل التسليم.',
    feature3_title: 'فواتير موحدة',
    feature3_desc: 'فاتورة واحدة لكل طلباتك. بسّط محاسبتك.',
    feature4_title: 'أسعار تنافسية',
    feature4_desc: 'نفاوض مع الموردين للحصول على أفضل الأسعار لك.',
    how_title: 'كيف يعمل',
    how_step1: '1. أنشئ حساب وسجّل شركتك',
    how_step2: '2. تصفح الكتالوج أو أرسل طلب عرض سعر',
    how_step3: '3. احصل على عرض سعر موحد منا',
    how_step4: '4. ادفع بأمان وتتبع طلبك',
    how_step5: '5. استلم منتجات مفحوصة الجودة',
    footer_about: 'عن سورسنج',
    footer_contact: 'اتصل بنا',
    footer_rights: '© 2026 سورسنج. جميع الحقوق محفوظة.',
  } : {
    title: 'Sourssing | B2B Procurement Platform for Egyptian Enterprises',
    description: 'Professional B2B procurement marketplace for companies and institutions. One trusted supplier. Guaranteed quality. Consolidated invoicing. Streamline your business procurement.',
    hero_title: 'Streamline Your B2B Procurement',
    hero_subtitle: 'One supplier. Guaranteed quality. Consolidated invoicing.',
    hero_desc: 'Sourssing is Egypt\'s leading B2B procurement platform. We provide one trusted supplier for all your company needs with quality assurance and competitive pricing.',
    cta_buyer: 'Register as Buyer',
    cta_vendor: 'Register as Vendor',
    feature1_title: 'One Trusted Supplier',
    feature1_desc: 'No need to deal with dozens of vendors. We provide everything you need.',
    feature2_title: 'Guaranteed Quality',
    feature2_desc: 'Strict quality inspection at our warehouse before delivery.',
    feature3_title: 'Consolidated Invoicing',
    feature3_desc: 'One invoice for all your orders. Simplify your accounting.',
    feature4_title: 'Competitive Pricing',
    feature4_desc: 'We negotiate with suppliers to get you the best prices.',
    how_title: 'How It Works',
    how_step1: '1. Create account and register your company',
    how_step2: '2. Browse catalog or submit RFQ',
    how_step3: '3. Receive consolidated quotation from us',
    how_step4: '4. Pay securely and track your order',
    how_step5: '5. Receive quality-inspected products',
    footer_about: 'About Sourssing',
    footer_contact: 'Contact Us',
    footer_rights: '© 2026 Sourssing. All rights reserved.',
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
        <meta name="keywords" content="${isArabic ? 'شراء, B2B, مصر, موردين, شركات, مشتريات' : 'procurement, B2B, Egypt, suppliers, enterprise, purchasing'}">
        <meta name="author" content="Sourssing">
        <link rel="canonical" href="${c.env.APP_URL || 'https://sourssing.com'}">
        
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
        
        <!-- Schema.org structured data -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Sourssing",
          "description": "${content.description}",
          "url": "${c.env.APP_URL || 'https://sourssing.com'}",
          "logo": "${c.env.APP_URL}/static/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+20-XXX-XXX-XXXX",
            "contactType": "customer service",
            "areaServed": "EG",
            "availableLanguage": ["en", "ar"]
          }
        }
        </script>
        
        <!-- Fonts & CSS -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cairo:wght@300;400;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <style>
          ${isArabic ? 'body { font-family: "Cairo", sans-serif; }' : 'body { font-family: "Inter", sans-serif; }'}
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                        <i class="fas fa-layer-group text-3xl text-purple-600 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}"></i>
                        <span class="text-2xl font-bold text-gray-900">Sourssing</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <a href="?lang=${isArabic ? 'en' : 'ar'}" class="text-gray-600 hover:text-purple-600">
                            <i class="fas fa-language ${dir === 'rtl' ? 'ml-2' : 'mr-2'}"></i>
                            ${isArabic ? 'English' : 'العربية'}
                        </a>
                        <a href="/login" class="text-gray-600 hover:text-purple-600 font-medium">
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
                       class="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg">
                        <i class="fas fa-building ${dir === 'rtl' ? 'ml-2' : 'mr-2'}"></i>
                        ${content.cta_buyer}
                    </a>
                    <a href="/register?role=vendor" 
                       class="bg-purple-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-900 transition shadow-lg">
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
                        <div class="text-purple-600 text-4xl mb-4">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-gray-900">${content.feature1_title}</h3>
                        <p class="text-gray-600">${content.feature1_desc}</p>
                    </div>
                    <div class="feature-card bg-white p-8 rounded-xl shadow-md">
                        <div class="text-purple-600 text-4xl mb-4">
                            <i class="fas fa-certificate"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-gray-900">${content.feature2_title}</h3>
                        <p class="text-gray-600">${content.feature2_desc}</p>
                    </div>
                    <div class="feature-card bg-white p-8 rounded-xl shadow-md">
                        <div class="text-purple-600 text-4xl mb-4">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-gray-900">${content.feature3_title}</h3>
                        <p class="text-gray-600">${content.feature3_desc}</p>
                    </div>
                    <div class="feature-card bg-white p-8 rounded-xl shadow-md">
                        <div class="text-purple-600 text-4xl mb-4">
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
                    <p class="text-2xl font-bold">Sourssing</p>
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
        <title>${isArabic ? 'تسجيل الدخول - سورسنج' : 'Login - Sourssing'}</title>
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
        <title>Register - Sourssing</title>
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

export default app
