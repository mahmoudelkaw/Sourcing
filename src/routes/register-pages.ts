// Registration Pages

import { Hono } from 'hono'
import type { Bindings } from '../types'

const registerPages = new Hono<{ Bindings: Bindings }>()

// Main Register Page
registerPages.get('/', (c) => {
  const role = c.req.query('role') || 'buyer'
  const lang = c.req.query('lang') || 'en'
  const isArabic = lang === 'ar'
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}" dir="${isArabic ? 'rtl' : 'ltr'}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isArabic ? 'تسجيل حساب - ليسورس' : 'Register - Lesorce'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          ${isArabic ? 'body { font-family: "Cairo", sans-serif; }' : 'body { font-family: "Inter", sans-serif; }'}
        </style>
    </head>
    <body class="bg-gray-100">
        <div class="min-h-screen py-12 px-4">
            <div class="max-w-3xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-8">
                    <i class="fas fa-layer-group text-5xl text-purple-600 mb-4"></i>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">
                        ${isArabic ? 'تسجيل حساب جديد' : 'Create Account'}
                    </h2>
                    <p class="text-gray-600">
                        ${role === 'buyer' 
                          ? (isArabic ? 'سجل كمشتري للوصول إلى آلاف المنتجات' : 'Register as Buyer to access thousands of products')
                          : (isArabic ? 'سجل كمورد لعرض منتجاتك' : 'Register as Vendor to showcase your products')}
                    </p>
                </div>

                <!-- Role Selector -->
                <div class="bg-white rounded-lg shadow p-6 mb-6">
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="switchRole('buyer')" 
                                id="buyer-btn"
                                class="role-btn ${role === 'buyer' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'} px-6 py-4 rounded-lg font-semibold transition">
                            <i class="fas fa-building mr-2"></i>
                            ${isArabic ? 'مشتري' : 'Buyer'}
                        </button>
                        <button onclick="switchRole('vendor')" 
                                id="vendor-btn"
                                class="role-btn ${role === 'vendor' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'} px-6 py-4 rounded-lg font-semibold transition">
                            <i class="fas fa-truck mr-2"></i>
                            ${isArabic ? 'مورد' : 'Vendor'}
                        </button>
                    </div>
                </div>

                <!-- Registration Form -->
                <div class="bg-white rounded-lg shadow p-8">
                    <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"></div>
                    <div id="success-message" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"></div>

                    <form id="registerForm" class="space-y-6">
                        <!-- Email -->
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                ${isArabic ? 'البريد الإلكتروني' : 'Email'}
                                <span class="text-red-500">*</span>
                            </label>
                            <input type="email" name="email" required
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                   placeholder="${isArabic ? 'company@example.com' : 'company@example.com'}">
                        </div>

                        <!-- Password -->
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                ${isArabic ? 'كلمة المرور' : 'Password'}
                                <span class="text-red-500">*</span>
                            </label>
                            <input type="password" name="password" required minlength="6"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                   placeholder="${isArabic ? 'الحد الأدنى 6 أحرف' : 'Minimum 6 characters'}">
                        </div>

                        <!-- Company Name -->
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                ${isArabic ? 'اسم الشركة' : 'Company Name'}
                                <span class="text-red-500">*</span>
                            </label>
                            <input type="text" name="company_name" required minlength="2"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                   placeholder="${isArabic ? 'مثال: شركة التكنولوجيا المتقدمة' : 'Example: Advanced Tech Solutions'}">
                        </div>

                        <!-- Tax ID -->
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                ${isArabic ? 'الرقم الضريبي' : 'Tax ID'}
                                <span class="text-red-500">*</span>
                            </label>
                            <input type="text" name="tax_id" required minlength="5"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                   placeholder="${isArabic ? 'الرقم الضريبي للشركة' : 'Company Tax ID'}">
                        </div>

                        <!-- Address -->
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                ${isArabic ? 'العنوان' : 'Address'}
                                <span class="text-red-500">*</span>
                            </label>
                            <textarea name="address" required minlength="10" rows="3"
                                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      placeholder="${isArabic ? '123 شارع الرئيسي، القاهرة' : '123 Main Street, Cairo'}"></textarea>
                        </div>

                        <!-- City -->
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                ${isArabic ? 'المدينة' : 'City'}
                                <span class="text-red-500">*</span>
                            </label>
                            <input type="text" name="city" required minlength="2"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                   placeholder="${isArabic ? 'القاهرة' : 'Cairo'}">
                        </div>

                        <!-- Contact Person -->
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                ${isArabic ? 'الشخص المسؤول' : 'Contact Person'}
                                <span class="text-red-500">*</span>
                            </label>
                            <input type="text" name="contact_person" required minlength="2"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                   placeholder="${isArabic ? 'أحمد محمد' : 'Ahmed Mohamed'}">
                        </div>

                        <!-- Phone -->
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                ${isArabic ? 'الهاتف' : 'Phone'}
                                <span class="text-red-500">*</span>
                            </label>
                            <input type="tel" name="phone" required minlength="10"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                   placeholder="${isArabic ? '+20 10 1234 5678' : '+20 10 1234 5678'}">
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" 
                                class="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition">
                            <i class="fas fa-user-plus mr-2"></i>
                            ${isArabic ? 'إنشاء حساب' : 'Create Account'}
                        </button>
                    </form>

                    <!-- Login Link -->
                    <div class="mt-6 text-center">
                        <p class="text-gray-600">
                            ${isArabic ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
                            <a href="/login${isArabic ? '?lang=ar' : ''}" class="text-purple-600 hover:underline font-medium">
                                ${isArabic ? 'تسجيل الدخول' : 'Login'}
                            </a>
                        </p>
                    </div>

                    <div class="mt-4 text-center">
                        <a href="/${isArabic ? '?lang=ar' : ''}" class="text-gray-500 hover:text-purple-600">
                            <i class="fas fa-arrow-${isArabic ? 'right' : 'left'} mr-2"></i>
                            ${isArabic ? 'العودة للرئيسية' : 'Back to home'}
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          let currentRole = '${role}';
          const isArabic = '${lang}' === 'ar';

          function switchRole(role) {
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('role', role);
            if (isArabic) urlParams.set('lang', 'ar');
            window.location.href = '/register?' + urlParams.toString();
          }

          document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
              email: formData.get('email'),
              password: formData.get('password'),
              company_name: formData.get('company_name'),
              tax_id: formData.get('tax_id'),
              address: formData.get('address'),
              city: formData.get('city'),
              contact_person: formData.get('contact_person'),
              phone: formData.get('phone')
            };

            const errorEl = document.getElementById('error-message');
            const successEl = document.getElementById('success-message');
            errorEl.classList.add('hidden');
            successEl.classList.add('hidden');

            try {
              const endpoint = currentRole === 'buyer' 
                ? '/api/auth/register/buyer' 
                : '/api/auth/register/vendor';

              const response = await axios.post(endpoint, data);
              
              if (response.data.success) {
                successEl.textContent = isArabic 
                  ? 'تم إنشاء الحساب بنجاح! جاري التحويل لتسجيل الدخول...'
                  : 'Account created successfully! Redirecting to login...';
                successEl.classList.remove('hidden');
                
                setTimeout(() => {
                  window.location.href = '/login' + (isArabic ? '?lang=ar' : '');
                }, 2000);
              }
            } catch (error) {
              console.error('Registration error:', error);
              const errorMsg = error.response?.data?.error || error.response?.data?.message ||
                (isArabic ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' : 'Registration failed. Please try again.');
              errorEl.textContent = errorMsg;
              errorEl.classList.remove('hidden');
            }
          });
        </script>
    </body>
    </html>
  `)
})

export default registerPages
