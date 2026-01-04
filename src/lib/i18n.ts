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
  
  // Vendor Portal
  'vendor.dashboard': { en: 'Vendor Dashboard', ar: 'لوحة تحكم المورد' },
  'vendor.rfq_invitations': { en: 'RFQ Invitations', ar: 'دعوات عروض الأسعار' },
  'vendor.my_bids': { en: 'My Bids', ar: 'عروضي' },
  'vendor.purchase_orders': { en: 'Purchase Orders', ar: 'أوامر الشراء' },
  'vendor.payments': { en: 'Payments', ar: 'المدفوعات' },
  'vendor.submit_bid': { en: 'Submit Bid', ar: 'تقديم عرض سعر' },
  
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
  'status.confirmed': { en: 'Confirmed', ar: 'مؤكد' },
  'status.processing': { en: 'Processing', ar: 'قيد المعالجة' },
  'status.shipped': { en: 'Shipped', ar: 'تم الشحن' },
  'status.delivered': { en: 'Delivered', ar: 'تم التسليم' },
  'status.cancelled': { en: 'Cancelled', ar: 'ملغي' },
  
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
