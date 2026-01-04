// Admin Portal Shared Layout
import type { Language } from '../types'

export function getAdminLayout(content: string, title: string = 'Admin Portal', lang: Language = 'en') {
  const isRTL = lang === 'ar'
  const dir = isRTL ? 'rtl' : 'ltr'
  
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
    <title>${title} - Sourssing Admin</title>
    <link href="${fontLink}" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: ${fontFamily}; }
        .nav-link.active { 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
        }
        .stat-card { transition: all 0.3s; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
        ${isRTL ? `
        [dir="rtl"] .ml-2 { margin-left: 0; margin-right: 0.5rem; }
        [dir="rtl"] .mr-2 { margin-right: 0; margin-left: 0.5rem; }
        [dir="rtl"] .text-left { text-align: right; }
        [dir="rtl"] .text-right { text-align: left; }
        ` : ''}
    </style>
</head>
<body class="bg-gray-50" data-lang="${lang}">
    <!-- Navigation -->
    <nav class="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center space-x-8">
                    <a href="/" class="flex items-center space-x-3">
                        <i class="fas fa-shield-alt text-2xl"></i>
                        <span class="text-xl font-bold">Sourssing Admin</span>
                    </a>
                    <div class="hidden md:flex space-x-2">
                        <a href="/admin/dashboard" class="nav-link px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-all">
                            <i class="fas fa-home mr-2"></i>Dashboard
                        </a>
                        <a href="/admin/users" class="nav-link px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-all">
                            <i class="fas fa-users mr-2"></i>Users
                        </a>
                        <a href="/admin/rfqs" class="nav-link px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-all">
                            <i class="fas fa-clipboard-list mr-2"></i>RFQs
                        </a>
                        <a href="/admin/orders" class="nav-link px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-all">
                            <i class="fas fa-shopping-cart mr-2"></i>Orders
                        </a>
                        <a href="/admin/payments" class="nav-link px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-all">
                            <i class="fas fa-dollar-sign mr-2"></i>Payments
                        </a>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <button class="flex items-center space-x-2">
                            <i class="fas fa-user-shield text-xl"></i>
                            <span class="text-sm font-medium" id="username">Admin</span>
                        </button>
                    </div>
                    <button onclick="logout()" class="px-4 py-2 text-sm font-medium bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all">
                        <i class="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        ${content}
    </main>

    <script>
        // Check authentication
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!token || user.role !== 'admin') {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
        
        // Set username
        if (user.email) {
            document.getElementById('username').textContent = user.email.split('@')[0];
        }
        
        // Mark active nav link
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
        
        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        // Helper: API call with auth
        async function apiCall(url, options = {}) {
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                    ...options.headers
                }
            });
            return response.json();
        }
        
        // Helper: Show toast notification
        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
            toast.className = \`fixed top-4 right-4 \${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in\`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    </script>
</body>
</html>
  `.trim()
}
