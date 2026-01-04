// Vendor Portal Shared Layout

export function getVendorLayout(content: string, title: string = 'Vendor Portal') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Sourssing</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .nav-link.active { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center space-x-8">
                    <a href="/" class="flex items-center space-x-3">
                        <i class="fas fa-boxes text-purple-600 text-2xl"></i>
                        <span class="text-xl font-bold text-gray-900">Sourssing</span>
                    </a>
                    <div class="hidden md:flex space-x-2">
                        <a href="/vendor/dashboard" class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
                            <i class="fas fa-home mr-2"></i>Dashboard
                        </a>
                        <a href="/vendor/rfqs" class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
                            <i class="fas fa-clipboard-list mr-2"></i>Available RFQs
                        </a>
                        <a href="/vendor/bids" class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
                            <i class="fas fa-file-invoice mr-2"></i>My Bids
                        </a>
                        <a href="/vendor/orders" class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
                            <i class="fas fa-shopping-cart mr-2"></i>Orders
                        </a>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <button onclick="toggleLanguage()" class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                        <i class="fas fa-language mr-1"></i>العربية
                    </button>
                    <div class="relative">
                        <button class="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                            <i class="fas fa-user-circle text-xl"></i>
                            <span class="text-sm font-medium" id="username">Vendor</span>
                        </button>
                    </div>
                    <button onclick="logout()" class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
        
        if (!token || user.role !== 'vendor') {
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
        
        function toggleLanguage() {
            const currentLang = new URLSearchParams(window.location.search).get('lang') || 'en';
            const newLang = currentLang === 'en' ? 'ar' : 'en';
            window.location.href = window.location.pathname + '?lang=' + newLang;
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
    </script>
</body>
</html>
  `.trim()
}
