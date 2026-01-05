import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const [isArabic, setIsArabic] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const langParam = urlParams.get('lang')
    const userLang = langParam || navigator.language
    const arabic = userLang === 'ar' || userLang.startsWith('ar')
    setLang(arabic ? 'ar' : 'en')
    setIsArabic(arabic)
    document.documentElement.lang = arabic ? 'ar' : 'en'
    document.documentElement.dir = arabic ? 'rtl' : 'ltr'
  }, [])

  const content = isArabic ? {
    title: 'ليسورس | مورد المستلزمات المكتبية ومواد التنظيف للشركات في مصر',
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
  } : {
    title: 'Lesorce | Office Supplies & Cleaning Products for Egyptian Businesses',
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
  }

  const dir = isArabic ? 'rtl' : 'ltr'

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <i className={`fas fa-pen-fancy text-3xl text-sky-600 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`}></i>
              <span className="text-2xl font-bold text-gray-900">Lesorce</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  const newLang = lang === 'en' ? 'ar' : 'en'
                  window.location.search = `?lang=${newLang}`
                }}
                className="text-gray-600 hover:text-sky-600"
              >
                <i className={`fas fa-language ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
                {isArabic ? 'English' : 'العربية'}
              </button>
              <Link to="/login" className="text-gray-600 hover:text-sky-600 font-medium">
                {isArabic ? 'تسجيل الدخول' : 'Login'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg text-white pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {content.hero_title}
          </h1>
          <p className="text-2xl md:text-3xl mb-4 font-light">
            {content.hero_subtitle}
          </p>
          <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto opacity-90">
            {content.hero_desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?role=buyer"
              className="bg-white text-sky-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg inline-block"
            >
              <i className={`fas fa-building ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
              {content.cta_buyer}
            </Link>
            <Link
              to="/register?role=vendor"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-emerald-700 transition shadow-lg inline-block"
            >
              <i className={`fas fa-truck ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
              {content.cta_vendor}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card bg-white p-8 rounded-xl shadow-md">
              <div className="text-sky-600 text-4xl mb-4">
                <i className="fas fa-pen"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{content.feature1_title}</h3>
              <p className="text-gray-600">{content.feature1_desc}</p>
            </div>
            <div className="feature-card bg-white p-8 rounded-xl shadow-md">
              <div className="text-emerald-600 text-4xl mb-4">
                <i className="fas fa-spray-can"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{content.feature2_title}</h3>
              <p className="text-gray-600">{content.feature2_desc}</p>
            </div>
            <div className="feature-card bg-white p-8 rounded-xl shadow-md">
              <div className="text-sky-600 text-4xl mb-4">
                <i className="fas fa-truck-fast"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{content.feature3_title}</h3>
              <p className="text-gray-600">{content.feature3_desc}</p>
            </div>
            <div className="feature-card bg-white p-8 rounded-xl shadow-md">
              <div className="text-emerald-600 text-4xl mb-4">
                <i className="fas fa-tags"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{content.feature4_title}</h3>
              <p className="text-gray-600">{content.feature4_desc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
