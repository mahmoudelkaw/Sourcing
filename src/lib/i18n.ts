// Internationalization (i18n) System - Arabic & English

import type { Language, Translations } from '../types'

// Translation dictionary
export const translations: Translations = {
  // Navigation & Common
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.about': { en: 'About', ar: 'عن سورسنج' },
  'nav.how_it_works': { en: 'How It Works', ar: 'كيف يعمل' },
  'nav.contact': { en: 'Contact', ar: 'اتصل بنا' },
  'nav.login': { en: 'Login', ar: 'تسجيل الدخول' },
  'nav.register': { en: 'Register', ar: 'التسجيل' },
  'nav.logout': { en: 'Logout', ar: 'تسجيل الخروج' },
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'nav.profile': { en: 'Profile', ar: 'الملف الشخصي' },
  'nav.settings': { en: 'Settings', ar: 'الإعدادات' },
  
  // Authentication
  'auth.email': { en: 'Email', ar: 'البريد الإلكتروني' },
  'auth.password': { en: 'Password', ar: 'كلمة المرور' },
  'auth.confirm_password': { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
  'auth.login': { en: 'Login', ar: 'تسجيل الدخول' },
  'auth.register': { en: 'Register', ar: 'التسجيل' },
  'auth.forgot_password': { en: 'Forgot Password?', ar: 'نسيت كلمة المرور؟' },
  'auth.remember_me': { en: 'Remember me', ar: 'تذكرني' },
  'auth.buyer': { en: 'Buyer', ar: 'مشتري' },
  'auth.vendor': { en: 'Vendor', ar: 'مورد' },
  'auth.role': { en: 'Register as', ar: 'التسجيل كـ' },
  
  // Company Info
  'company.name': { en: 'Company Name', ar: 'اسم الشركة' },
  'company.tax_id': { en: 'Tax ID', ar: 'الرقم الضريبي' },
  'company.address': { en: 'Address', ar: 'العنوان' },
  'company.city': { en: 'City', ar: 'المدينة' },
  'company.contact_person': { en: 'Contact Person', ar: 'الشخص المسؤول' },
  'company.phone': { en: 'Phone Number', ar: 'رقم الهاتف' },
  
  // Buyer Portal
  'buyer.dashboard': { en: 'Buyer Dashboard', ar: 'لوحة تحكم المشتري' },
  'buyer.catalog': { en: 'Product Catalog', ar: 'كتالوج المنتجات' },
  'buyer.create_rfq': { en: 'Create RFQ', ar: 'إنشاء طلب عرض أسعار' },
  'buyer.my_rfqs': { en: 'My RFQs', ar: 'طلباتي' },
  'buyer.quotations': { en: 'Quotations', ar: 'عروض الأسعار' },
  'buyer.orders': { en: 'My Orders', ar: 'طلباتي' },
  'buyer.buy_again': { en: 'Buy Again', ar: 'اطلب مرة أخرى' },
  'buyer.upload_ocr': { en: 'Upload & OCR', ar: 'رفع ومسح ضوئي' },
  'buyer.welcome': { en: 'Welcome back', ar: 'مرحباً بعودتك' },
  'buyer.total_rfqs': { en: 'Total RFQs', ar: 'إجمالي الطلبات' },
  'buyer.active_rfqs': { en: 'Active RFQs', ar: 'الطلبات النشطة' },
  'buyer.total_orders': { en: 'Total Orders', ar: 'إجمالي الطلبات' },
  'buyer.total_spent': { en: 'Total Spent', ar: 'إجمالي الإنفاق' },
  'buyer.recent_rfqs': { en: 'Recent RFQs', ar: 'الطلبات الأخيرة' },
  'buyer.recent_orders': { en: 'Recent Orders', ar: 'الطلبات الأخيرة' },
  'buyer.browse_catalog': { en: 'Browse our extensive catalog', ar: 'تصفح الكتالوج الشامل' },
  'buyer.search_products': { en: 'Search by name, SKU, or brand', ar: 'بحث بالاسم أو الرمز أو العلامة' },
  'buyer.all_categories': { en: 'All Categories', ar: 'كل الفئات' },
  'buyer.no_products': { en: 'No products found', ar: 'لا توجد منتجات' },
  'buyer.confirm_payment': { en: 'Confirm Payment', ar: 'تأكيد الدفع' },
  'buyer.payment_reference': { en: 'Payment Reference', ar: 'مرجع الدفع' },
  'buyer.upload_document': { en: 'Upload Document', ar: 'رفع المستند' },
  'buyer.drag_drop': { en: 'Drag and drop file here, or click to select', ar: 'اسحب وأفلت الملف هنا، أو انقر للاختيار' },
  'buyer.ai_extracting': { en: 'AI is extracting data from your document...', ar: 'الذكاء الاصطناعي يستخرج البيانات...' },
  'buyer.review_edit': { en: 'Review and edit extracted data', ar: 'مراجعة وتعديل البيانات المستخرجة' },
  
  // Vendor Portal
  'vendor.dashboard': { en: 'Vendor Dashboard', ar: 'لوحة تحكم المورد' },
  'vendor.rfq_invitations': { en: 'RFQ Invitations', ar: 'دعوات عروض الأسعار' },
  'vendor.my_bids': { en: 'My Bids', ar: 'عروضي' },
  'vendor.purchase_orders': { en: 'Purchase Orders', ar: 'أوامر الشراء' },
  'vendor.payments': { en: 'Payments', ar: 'المدفوعات' },
  'vendor.submit_bid': { en: 'Submit Bid', ar: 'تقديم عرض سعر' },
  'vendor.welcome': { en: 'Welcome back', ar: 'مرحباً بعودتك' },
  'vendor.total_bids': { en: 'Total Bids', ar: 'إجمالي العروض' },
  'vendor.active_bids': { en: 'Active Bids', ar: 'العروض النشطة' },
  'vendor.won_bids': { en: 'Won Bids', ar: 'العروض الفائزة' },
  'vendor.total_revenue': { en: 'Total Revenue', ar: 'إجمالي الإيرادات' },
  'vendor.available_rfqs': { en: 'Available RFQs', ar: 'الطلبات المتاحة' },
  'vendor.rfq_details': { en: 'RFQ Details', ar: 'تفاصيل الطلب' },
  'vendor.items_requested': { en: 'Items Requested', ar: 'المنتجات المطلوبة' },
  'vendor.unit_price': { en: 'Unit Price', ar: 'سعر الوحدة' },
  'vendor.total_price': { en: 'Total Price', ar: 'السعر الإجمالي' },
  'vendor.delivery_time': { en: 'Delivery Time (days)', ar: 'وقت التسليم (أيام)' },
  'vendor.notes': { en: 'Notes', ar: 'ملاحظات' },
  'vendor.bid_submitted': { en: 'Bid submitted successfully', ar: 'تم تقديم العرض بنجاح' },
  'vendor.bid_status': { en: 'Bid Status', ar: 'حالة العرض' },
  'vendor.submitted': { en: 'Submitted', ar: 'مقدم' },
  'vendor.under_review': { en: 'Under Review', ar: 'قيد المراجعة' },
  'vendor.accepted': { en: 'Accepted', ar: 'مقبول' },
  'vendor.rejected': { en: 'Rejected', ar: 'مرفوض' },
  
  // Admin Portal
  'admin.dashboard': { en: 'Admin Dashboard', ar: 'لوحة تحكم المسؤول' },
  'admin.users': { en: 'Users', ar: 'المستخدمون' },
  'admin.buyers': { en: 'Buyers', ar: 'المشترون' },
  'admin.vendors': { en: 'Vendors', ar: 'الموردون' },
  'admin.rfqs': { en: 'RFQs', ar: 'طلبات الأسعار' },
  'admin.orders': { en: 'Orders', ar: 'الطلبات' },
  'admin.payments': { en: 'Payments', ar: 'المدفوعات' },
  'admin.qa': { en: 'Quality Assurance', ar: 'ضمان الجودة' },
  'admin.reports': { en: 'Reports', ar: 'التقارير' },
  'admin.approve': { en: 'Approve', ar: 'موافقة' },
  'admin.reject': { en: 'Reject', ar: 'رفض' },
  'admin.welcome': { en: 'Welcome, Admin', ar: 'مرحباً، المسؤول' },
  'admin.platform_overview': { en: 'Platform Overview', ar: 'نظرة عامة على المنصة' },
  'admin.total_users': { en: 'Total Users', ar: 'إجمالي المستخدمين' },
  'admin.total_rfqs': { en: 'Total RFQs', ar: 'إجمالي الطلبات' },
  'admin.total_orders': { en: 'Total Orders', ar: 'إجمالي الطلبات' },
  'admin.total_revenue': { en: 'Total Revenue', ar: 'إجمالي الإيرادات' },
  'admin.pending_approvals': { en: 'Pending Approvals', ar: 'الموافقات المعلقة' },
  'admin.user_management': { en: 'User Management', ar: 'إدارة المستخدمين' },
  'admin.rfq_management': { en: 'RFQ Management', ar: 'إدارة الطلبات' },
  'admin.order_management': { en: 'Order Management', ar: 'إدارة الطلبات' },
  'admin.payment_management': { en: 'Payment Management', ar: 'إدارة المدفوعات' },
  'admin.escrow_balance': { en: 'Escrow Balance', ar: 'رصيد الضمان' },
  'admin.pending_payments': { en: 'Pending Payments', ar: 'المدفوعات المعلقة' },
  'admin.verified_payments': { en: 'Verified Payments', ar: 'المدفوعات المؤكدة' },
  'admin.released_payments': { en: 'Released Payments', ar: 'المدفوعات المحولة' },
  'admin.verify_payment': { en: 'Verify Payment', ar: 'تأكيد الدفع' },
  'admin.release_payment': { en: 'Release Payment', ar: 'تحويل الدفع' },
  'admin.qa_pass': { en: 'QA Pass', ar: 'اجتياز الفحص' },
  'admin.qa_fail': { en: 'QA Fail', ar: 'فشل الفحص' },
  'admin.awaiting_qa': { en: 'Awaiting QA', ar: 'بانتظار الفحص' },
  'admin.in_warehouse': { en: 'In Warehouse', ar: 'في المستودع' },
  'admin.action_required': { en: 'Action Required', ar: 'مطلوب إجراء' },
  
  // RFQ
  'rfq.title': { en: 'RFQ Title', ar: 'عنوان الطلب' },
  'rfq.description': { en: 'Description', ar: 'الوصف' },
  'rfq.delivery_address': { en: 'Delivery Address', ar: 'عنوان التسليم' },
  'rfq.required_date': { en: 'Required Delivery Date', ar: 'تاريخ التسليم المطلوب' },
  'rfq.upload_excel': { en: 'Upload Excel', ar: 'رفع ملف Excel' },
  'rfq.upload_pdf': { en: 'Upload PDF', ar: 'رفع ملف PDF' },
  'rfq.upload_image': { en: 'Upload Image', ar: 'رفع صورة' },
  'rfq.manual_entry': { en: 'Manual Entry', ar: 'إدخال يدوي' },
  'rfq.submit': { en: 'Submit RFQ', ar: 'إرسال الطلب' },
  'rfq.number': { en: 'RFQ Number', ar: 'رقم الطلب' },
  'rfq.status': { en: 'RFQ Status', ar: 'حالة الطلب' },
  'rfq.items': { en: 'Items', ar: 'المنتجات' },
  'rfq.item_name': { en: 'Item Name', ar: 'اسم المنتج' },
  'rfq.specifications': { en: 'Specifications', ar: 'المواصفات' },
  'rfq.draft': { en: 'Draft', ar: 'مسودة' },
  'rfq.submitted': { en: 'Submitted', ar: 'مقدم' },
  'rfq.quoted': { en: 'Quoted', ar: 'تم عرض الأسعار' },
  'rfq.accepted': { en: 'Accepted', ar: 'مقبول' },
  'rfq.completed': { en: 'Completed', ar: 'مكتمل' },
  'rfq.cancelled': { en: 'Cancelled', ar: 'ملغي' },
  'rfq.add_item': { en: 'Add Item', ar: 'إضافة منتج' },
  'rfq.remove_item': { en: 'Remove Item', ar: 'إزالة منتج' },
  'rfq.total_items': { en: 'Total Items', ar: 'إجمالي المنتجات' },
  'rfq.created_at': { en: 'Created At', ar: 'تاريخ الإنشاء' },
  'rfq.submitted_at': { en: 'Submitted At', ar: 'تاريخ التقديم' },
  
  // Products
  'product.name': { en: 'Product Name', ar: 'اسم المنتج' },
  'product.sku': { en: 'SKU', ar: 'رمز المنتج' },
  'product.category': { en: 'Category', ar: 'الفئة' },
  'product.brand': { en: 'Brand', ar: 'العلامة التجارية' },
  'product.unit': { en: 'Unit', ar: 'الوحدة' },
  'product.quantity': { en: 'Quantity', ar: 'الكمية' },
  'product.price': { en: 'Price', ar: 'السعر' },
  'product.moq': { en: 'MOQ', ar: 'الحد الأدنى للطلب' },
  
  // Orders
  'order.number': { en: 'Order Number', ar: 'رقم الطلب' },
  'order.date': { en: 'Order Date', ar: 'تاريخ الطلب' },
  'order.status': { en: 'Status', ar: 'الحالة' },
  'order.total': { en: 'Total', ar: 'الإجمالي' },
  'order.delivery_date': { en: 'Delivery Date', ar: 'تاريخ التسليم' },
  'order.track': { en: 'Track Order', ar: 'تتبع الطلب' },
  
  // Order Status
  'status.pending': { en: 'Pending', ar: 'قيد الانتظار' },
  'status.pending_payment': { en: 'Pending Payment', ar: 'بانتظار الدفع' },
  'status.confirmed': { en: 'Confirmed', ar: 'مؤكد' },
  'status.processing': { en: 'Processing', ar: 'قيد المعالجة' },
  'status.in_warehouse': { en: 'In Warehouse', ar: 'في المستودع' },
  'status.qa_pending': { en: 'QA Pending', ar: 'بانتظار الفحص' },
  'status.qa_passed': { en: 'QA Passed', ar: 'اجتاز الفحص' },
  'status.qa_failed': { en: 'QA Failed', ar: 'فشل الفحص' },
  'status.shipped': { en: 'Shipped', ar: 'تم الشحن' },
  'status.delivered': { en: 'Delivered', ar: 'تم التسليم' },
  'status.completed': { en: 'Completed', ar: 'مكتمل' },
  'status.cancelled': { en: 'Cancelled', ar: 'ملغي' },
  'status.active': { en: 'Active', ar: 'نشط' },
  'status.inactive': { en: 'Inactive', ar: 'غير نشط' },
  'status.approved': { en: 'Approved', ar: 'موافق عليه' },
  'status.rejected': { en: 'Rejected', ar: 'مرفوض' },
  
  // Payments
  'payment.method': { en: 'Payment Method', ar: 'طريقة الدفع' },
  'payment.status': { en: 'Payment Status', ar: 'حالة الدفع' },
  'payment.amount': { en: 'Amount', ar: 'المبلغ' },
  'payment.paid': { en: 'Paid', ar: 'مدفوع' },
  'payment.pending': { en: 'Pending', ar: 'قيد الانتظار' },
  
  // Common Actions
  'action.save': { en: 'Save', ar: 'حفظ' },
  'action.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'action.edit': { en: 'Edit', ar: 'تعديل' },
  'action.delete': { en: 'Delete', ar: 'حذف' },
  'action.view': { en: 'View', ar: 'عرض' },
  'action.download': { en: 'Download', ar: 'تنزيل' },
  'action.upload': { en: 'Upload', ar: 'رفع' },
  'action.search': { en: 'Search', ar: 'بحث' },
  'action.filter': { en: 'Filter', ar: 'تصفية' },
  'action.add': { en: 'Add', ar: 'إضافة' },
  'action.remove': { en: 'Remove', ar: 'إزالة' },
  'action.submit': { en: 'Submit', ar: 'إرسال' },
  'action.confirm': { en: 'Confirm', ar: 'تأكيد' },
  
  // Messages
  'msg.success': { en: 'Operation successful', ar: 'تمت العملية بنجاح' },
  'msg.error': { en: 'An error occurred', ar: 'حدث خطأ' },
  'msg.loading': { en: 'Loading...', ar: 'جاري التحميل...' },
  'msg.no_data': { en: 'No data available', ar: 'لا توجد بيانات' },
  'msg.confirm_delete': { en: 'Are you sure you want to delete this?', ar: 'هل أنت متأكد من الحذف؟' },
  
  // Landing Page
  'landing.hero_title': { 
    en: 'Streamline Your B2B Procurement', 
    ar: 'بسّط عمليات الشراء للشركات' 
  },
  'landing.hero_subtitle': { 
    en: 'One supplier. Guaranteed quality. Consolidated invoicing.', 
    ar: 'مورد واحد. جودة مضمونة. فواتير موحدة.' 
  },
  'landing.get_started': { en: 'Get Started', ar: 'ابدأ الآن' },
  'landing.learn_more': { en: 'Learn More', ar: 'اعرف المزيد' },
}

// Translation function
export function t(key: string, lang: Language = 'en'): string {
  const translation = translations[key]
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`)
    return key
  }
  return translation[lang] || translation.en
}

// Get text direction for language
export function getDir(lang: Language): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr'
}

// Get HTML lang attribute
export function getLangAttr(lang: Language): string {
  return lang === 'ar' ? 'ar' : 'en'
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = 'EGP', lang: Language = 'en'): string {
  const formatter = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  })
  return formatter.format(amount)
}

// Format date for display
export function formatDate(date: string | Date, lang: Language = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  return formatter.format(d)
}

// Format number
export function formatNumber(num: number, lang: Language = 'en'): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG').format(num)
}

// Get current language from URL or localStorage
export function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang')
    if (urlLang === 'ar' || urlLang === 'en') {
      return urlLang
    }
    const savedLang = localStorage.getItem('lang')
    if (savedLang === 'ar' || savedLang === 'en') {
      return savedLang
    }
  }
  return 'en'
}

// Save language preference
export function saveLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lang', lang)
  }
}

// Language toggle component HTML
export function getLanguageToggle(currentLang: Language = 'en'): string {
  return `
    <div class="language-toggle">
      <button 
        id="lang-toggle-btn" 
        class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="${currentLang === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}"
      >
        <i class="fas fa-language"></i>
        <span>${currentLang === 'en' ? 'العربية' : 'English'}</span>
      </button>
    </div>
    
    <script>
      (function() {
        const toggleBtn = document.getElementById('lang-toggle-btn');
        const currentLang = '${currentLang}';
        
        toggleBtn.addEventListener('click', function() {
          const newLang = currentLang === 'en' ? 'ar' : 'en';
          localStorage.setItem('lang', newLang);
          
          // Update URL with new language
          const url = new URL(window.location.href);
          url.searchParams.set('lang', newLang);
          window.location.href = url.toString();
        });
      })();
    </script>
  `
}
