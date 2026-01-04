// Buyer Portal Layout Helper
import type { Language } from '../types'

export function buyerLayout(content: string, activeMenu: string = 'dashboard', lang: Language = 'en') {
  const isRTL = lang === 'ar'
  const dir = isRTL ? 'rtl' : 'ltr'
  
  // Font based on language
  const fontFamily = isRTL 
    ? '"Cairo", "Inter", sans-serif' 
    : '"Inter", sans-serif'
  
  const fontLink = isRTL
    ? 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    : 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
  
  return `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${dir}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Buyer Portal - Sourssing</title>
        <link href="${fontLink}" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body { font-family: ${fontFamily}; }
          .nav-link.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .product-card { transition: transform 0.2s, box-shadow 0.2s; }
          .product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          ${isRTL ? `
          [dir="rtl"] .ml-2 { margin-left: 0; margin-right: 0.5rem; }
          [dir="rtl"] .mr-2 { margin-right: 0; margin-left: 0.5rem; }
          [dir="rtl"] .ml-4 { margin-left: 0; margin-right: 1rem; }
          [dir="rtl"] .mr-4 { margin-right: 0; margin-left: 1rem; }
          [dir="rtl"] .pl-4 { padding-left: 0; padding-right: 1rem; }
          [dir="rtl"] .pr-4 { padding-right: 0; padding-left: 1rem; }
          [dir="rtl"] .text-left { text-align: right; }
          [dir="rtl"] .text-right { text-align: left; }
          ` : ''}
        </style>
    </head>
    <body class="bg-gray-50" data-lang="${lang}">
        <!-- Top Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-layer-group text-2xl text-purple-600"></i>
                        <span class="text-xl font-bold text-gray-900">Sourssing</span>
                        <span class="text-sm text-gray-500 ml-2">| Buyer Portal</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <!-- Language Toggle -->
                        <button id="lang-toggle-btn" class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors" title="${isRTL ? 'Switch to English' : 'التبديل إلى العربية'}">
                            <i class="fas fa-language"></i>
                            <span>${isRTL ? 'English' : 'العربية'}</span>
                        </button>
                        
                        <div class="relative">
                            <button onclick="toggleUserMenu()" class="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                                <i class="fas fa-user-circle text-2xl"></i>
                                <span id="user-name">${isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                                <i class="fas fa-chevron-down text-xs"></i>
                            </button>
                            <div id="user-menu" class="hidden absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                <a href="/buyer/dashboard?lang=${lang}" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    <i class="fas fa-user ${isRTL ? 'ml-2' : 'mr-2'}"></i>${isRTL ? 'الملف الشخصي' : 'Profile'}
                                </a>
                                <hr class="my-2">
                                <a href="#" onclick="logout()" class="block px-4 py-2 text-red-600 hover:bg-gray-100">
                                    <i class="fas fa-sign-out-alt ${isRTL ? 'ml-2' : 'mr-2'}"></i>${isRTL ? 'تسجيل الخروج' : 'Logout'}
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
                    <a href="/buyer/dashboard" class="nav-link ${activeMenu === 'dashboard' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-home w-5"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="/buyer/catalog" class="nav-link ${activeMenu === 'catalog' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-th-large w-5"></i>
                        <span>Product Catalog</span>
                    </a>
                    <a href="/buyer/rfq/create" class="nav-link ${activeMenu === 'create-rfq' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-plus-circle w-5"></i>
                        <span>Create RFQ</span>
                    </a>
                    <a href="/buyer/rfqs" class="nav-link ${activeMenu === 'rfqs' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-file-alt w-5"></i>
                        <span>My RFQs</span>
                    </a>
                    <a href="/buyer/upload" class="nav-link ${activeMenu === 'upload' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-cloud-upload-alt w-5"></i>
                        <span>Upload & OCR</span>
                    </a>
                    <a href="/buyer/quotations" class="nav-link ${activeMenu === 'quotations' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-file-invoice-dollar w-5"></i>
                        <span>Quotations</span>
                    </a>
                    <a href="/buyer/orders" class="nav-link ${activeMenu === 'orders' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-shopping-cart w-5"></i>
                        <span>My Orders</span>
                    </a>
                    <a href="/buyer/buy-again" class="nav-link ${activeMenu === 'buy-again' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                        <i class="fas fa-redo w-5"></i>
                        <span>Buy Again</span>
                    </a>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 overflow-y-auto p-8">
                ${content}
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
          
          // Load user profile
          axios.get('/api/auth/me')
            .then(response => {
              if (response.data.success) {
                const profile = response.data.data.profile;
                document.getElementById('user-name').textContent = profile?.contact_person || user.email;
              }
            })
            .catch(error => console.error('Failed to load profile'));
          
          // Toggle user menu
          function toggleUserMenu() {
            document.getElementById('user-menu').classList.toggle('hidden');
          }
          
          // Close menu when clicking outside
          document.addEventListener('click', (e) => {
            const menu = document.getElementById('user-menu');
            const button = e.target.closest('button[onclick="toggleUserMenu()"]');
            if (!button && !menu.contains(e.target)) {
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
          document.getElementById('lang-toggle-btn').addEventListener('click', function() {
            const currentLang = document.body.dataset.lang || 'en';
            const newLang = currentLang === 'en' ? 'ar' : 'en';
            localStorage.setItem('lang', newLang);
            
            const url = new URL(window.location.href);
            url.searchParams.set('lang', newLang);
            window.location.href = url.toString();
          });
        </script>
    </body>
    </html>
  `
}
