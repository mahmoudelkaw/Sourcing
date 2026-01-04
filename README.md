# lesorce - B2B Procurement Platform

**Professional enterprise-grade B2B marketplace for Egyptian companies**

![Status](https://img.shields.io/badge/status-MVP_Ready-success)
![Tech](https://img.shields.io/badge/tech-Hono_+_Cloudflare-blue)
![Languages](https://img.shields.io/badge/languages-Arabic_+_English-orange)

## 🚀 Project Overview

lesorce is a managed B2B procurement marketplace designed specifically for Egyptian enterprises. Unlike traditional marketplaces, **lesorce is the single merchant of record** - buyers never see vendors, vendors never see buyers, and all transactions flow through lesorce.

### Key Business Model

- **One Supplier Model**: lesorce acts as the sole supplier to all buyers
- **Private Vendor Bidding**: Vendors submit bids privately; buyers only see lesorce's consolidated quotation
- **Quality Assurance**: All products inspected at lesorce warehouse before delivery
- **Consolidated Invoicing**: One invoice per buyer, simplifying accounting
- **Smart Consolidation**: Multiple buyer requests for same SKU = one bulk PO to factory

## 🌟 Features Implemented (Phase 1-3 Complete)

### ✅ Phase 1: Core Authentication & Database
- [x] User registration (Buyer/Vendor/Admin roles)
- [x] Secure JWT-based authentication
- [x] Role-based access control (RBAC)
- [x] Complete 24-table database schema
- [x] 50+ seeded Egyptian B2B products
- [x] Bilingual support (Arabic RTL + English LTR)
- [x] SEO-optimized landing page

### ✅ Phase 2: Buyer Portal
- [x] Buyer Dashboard with overview stats
- [x] Product Catalog browsing (50+ products, 10 categories)
- [x] Create RFQ form with multiple items
- [x] My RFQs listing with status tracking
- [x] Search and filter products
- [x] **API**: Products (4 endpoints), RFQs (4 endpoints)

### ✅ Phase 3: Vendor & Admin Portals (NEW)
**Vendor Portal:**
- [x] Vendor Dashboard with bid statistics
- [x] Browse Available RFQs (open for bidding)
- [x] Submit Bids with pricing and lead time
- [x] My Bids tracking with status
- [x] Private bidding (can't see other vendors' bids)
- [x] **API**: Bids (5 endpoints)

**Admin Portal:**
- [x] Admin Dashboard with platform-wide stats
- [x] User Management (approve/suspend accounts)
- [x] RFQ Management (view all RFQs and bids)
- [x] Bid Review & Acceptance workflow
- [x] Orders Management with QA tracking
- [x] Quality Assurance pass/fail workflow
- [x] **API**: Admin (8 endpoints)

### 📊 Current Metrics
- **Total Code**: ~8,500 lines (TypeScript + SQL)
- **API Endpoints**: 25 (Auth: 4, Products: 4, RFQs: 4, Bids: 5, Admin: 8)
- **Portal Pages**: 11 (Landing: 2, Buyer: 3, Vendor: 3, Admin: 3)
- **Database Tables**: 24 with full relationships
- **Git Commits**: 9
- **Test Accounts**: 3 (Admin, Buyer, Vendor)

### ✅ UI/UX
- [x] Responsive design (mobile-friendly)
- [x] Three distinct portal themes (Buyer: Blue, Vendor: Purple, Admin: Orange)
- [x] Shared layout components for consistency
- [x] Toast notifications for user feedback
- [x] Modal windows for detailed views
- [x] Loading states and spinners
- [x] Color-coded status badges
- [x] Bilingual interface (Arabic + English)
- [x] Responsive design (mobile-first)
- [x] Professional gradient design
- [x] Login page with error handling
- [x] Meta tags for social sharing (Open Graph, Twitter Cards)
- [x] Schema.org structured data

### ✅ Deployment Ready
- [x] Cloudflare Pages configuration
- [x] D1 SQLite database (local + production ready)
- [x] PM2 process management
- [x] Environment variables setup
- [x] Git repository initialized

## 📋 What's Not Implemented Yet

### Backend APIs (To be built)
- [ ] Product catalog API
- [ ] RFQ creation and management
- [ ] File upload for RFQ (Excel/PDF/Image)
- [ ] OCR integration with OpenAI
- [ ] Vendor bidding endpoints
- [ ] Quotation generation
- [ ] Order management
- [ ] Payment processing
- [ ] Quality assurance workflow
- [ ] Buy Again analytics
- [ ] Admin approval workflows

### ⏳ Remaining Features (Phase 4-5)
- [ ] Orders API and workflow
- [ ] Payment processing and escrow
- [ ] File upload (Excel/PDF/Images)
- [ ] OpenAI OCR integration for automated RFQ creation
- [ ] Complete Arabic RTL translations
- [ ] Order tracking interface
- [ ] Buy Again recommendations
- [ ] Notifications system
- [ ] Production Cloudflare deployment

## 🏗️ Tech Stack

### Backend
- **Framework**: Hono (lightweight, fast, edge-compatible)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: JWT with Web Crypto API
- **Validation**: Zod

### Frontend
- **Framework**: Server-rendered HTML (Hono)
- **Styling**: TailwindCSS (CDN)
- **Icons**: Font Awesome
- **Typography**: Inter (English), Cairo (Arabic)
- **HTTP Client**: Axios (CDN)

### DevOps
- **Build**: Vite
- **Process Manager**: PM2
- **Version Control**: Git
- **Deployment**: Cloudflare Pages
- **CLI**: Wrangler

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Wrangler CLI (for Cloudflare)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd webapp

# Install dependencies
npm install

# Setup environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your secrets
```

### Database Setup

```bash
# Apply migrations locally
npm run db:migrate:local

# Check database
npm run db:console:local
```

### Development

```bash
# Build project
npm run build

# Start development server (Option 1: Direct)
npm run dev:sandbox

# Start development server (Option 2: PM2 - Recommended)
npm run clean-port
pm2 start ecosystem.config.cjs
pm2 logs lesorce --nostream

# Test endpoints
curl http://localhost:3000
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lesorce.com","password":"admin123"}'
```

## 🌐 Live Demo

**Development URL**: https://3000-imt8bnzh9fjq3e1fmww7u-8f57ffe2.sandbox.novita.ai

### Portal Access Points

| Portal | URL | Description |
|--------|-----|-------------|
| Landing | https://3000-imt8bnzh9fjq3e1fmww7u-8f57ffe2.sandbox.novita.ai | Homepage (EN/AR) |
| Buyer | `/buyer/dashboard` | Buyer portal |
| Vendor | `/vendor/dashboard` | Vendor portal |
| Admin | `/admin/dashboard` | Admin panel |

### Test Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@lesorce.com | admin123 | Full platform control |
| Buyer | buyer@company.com | admin123 | Browse, create RFQs |
| Vendor | vendor@supplier.com | admin123 | View RFQs, submit bids |

### Quick Test Flow

**Try the Full Workflow**:
```bash
1. Login as Buyer → Create RFQ with 2-3 items
2. Login as Vendor → View available RFQs → Submit bid
3. Login as Admin → Review bids → Accept winning bid
4. Login as Admin → Manage orders → Perform QA
```

## 📡 API Endpoints (25 Total)

### Authentication (4 endpoints)
- `POST /api/auth/login` - User authentication, returns JWT
- `POST /api/auth/register/buyer` - Buyer registration
- `POST /api/auth/register/vendor` - Vendor registration
- `GET /api/auth/me` - Get current user profile

### Products (4 endpoints)
- `GET /api/products` - List products with pagination
- `GET /api/products/:id` - Get product details
- `GET /api/products/categories/list` - List all categories
- `GET /api/products/category/:slug` - Get products by category

### RFQs (4 endpoints) - Buyer only
- `POST /api/rfqs` - Create new RFQ
- `GET /api/rfqs` - List buyer's RFQs
- `GET /api/rfqs/:id` - Get RFQ details with items
- `POST /api/rfqs/:id/submit` - Submit RFQ for processing

### Bids (5 endpoints) - Vendor only
- `POST /api/bids` - Submit new bid
- `GET /api/bids` - List vendor's bids
- `GET /api/bids/:id` - Get bid details
- `GET /api/bids/rfqs` - List available RFQs (not yet bid)
- `GET /api/bids/rfqs/:id` - Get RFQ details for bidding

### Admin (8 endpoints) - Admin only
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/rfqs` - List all RFQs
- `GET /api/admin/bids/:rfqId` - Get all bids for RFQ
- `PUT /api/admin/bids/:id/status` - Accept/reject bid
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/:id/qa` - Update QA status

## 📊 Database Schema Highlights

### Core Tables (24 total)
- **users**: Authentication and roles
- **buyer_profiles** / **vendor_profiles**: Company information
- **categories** / **products**: Product catalog (50+ items seeded)
- **rfqs** / **rfq_items**: Request for Quotation system
- **vendor_bids**: Private vendor bidding
- **quotations** / **quotation_items**: Consolidated pricing to buyers
- **orders** / **order_items**: Order management
- **vendor_purchase_orders**: POs sent to vendors
- **qa_inspections**: Quality assurance
- **payments** / **vendor_payments**: Escrow-style payment tracking
- **notifications**: User notifications
- **reorder_predictions**: Buy Again analytics
- **audit_logs**: System audit trail

## 🔒 Security Features

- JWT-based authentication
- SHA-256 password hashing (Web Crypto API)
- CORS enabled for API
- Input validation with Zod
- SQL injection protection (prepared statements)
- Role-based access control
- Audit logging

## 🌍 Internationalization (i18n)

- **Languages**: Arabic (RTL) + English (LTR)
- **Translation System**: Built-in key-value translation dictionary
- **Number Formatting**: Locale-aware (Arabic/English numerals)
- **Currency Formatting**: EGP with proper locale
- **Date Formatting**: Intl.DateTimeFormat with locale support

## 📱 SEO Optimization

- ✅ Meta tags (title, description, keywords)
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Card tags
- ✅ Schema.org structured data (Organization)
- ✅ Canonical URLs
- ✅ Language alternates
- ✅ Mobile-responsive viewport
- ✅ Performance optimized (CDN resources)

## 🚀 Deployment

### Local Development (Sandbox)

```bash
# Kill existing process
npm run clean-port

# Build and start
npm run build
pm2 start ecosystem.config.cjs

# Check status
pm2 status
pm2 logs lesorce --nostream
```

### Production Deployment to Cloudflare Pages

```bash
# Build project
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Or manually
wrangler pages deploy dist --project-name lesorce
```

## 📁 Project Structure

```
webapp/
├── migrations/              # D1 database migrations
│   ├── 0001_initial_schema.sql
│   └── 0002_seed_data.sql
├── public/                  # Static assets
│   └── static/             # Served at /static/*
├── src/
│   ├── index.tsx           # Main app entry
│   ├── lib/                # Utilities
│   │   ├── db.ts           # Database helpers
│   │   ├── i18n.ts         # Internationalization
│   │   └── jwt.ts          # JWT utilities
│   ├── middleware/         # Hono middleware
│   │   └── auth.ts         # Authentication middleware
│   ├── routes/             # API routes
│   │   └── auth.ts         # Auth endpoints
│   └── types/              # TypeScript types
│       └── index.ts        # Type definitions
├── .dev.vars               # Environment variables (local)
├── .gitignore              # Git ignore rules
├── ecosystem.config.cjs    # PM2 configuration
├── package.json            # Dependencies
├── README.md               # This file
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite build config
└── wrangler.jsonc          # Cloudflare config
```

## 🎯 Roadmap

### Phase 1: MVP Completion (Current Sprint)
- [ ] Complete buyer registration form
- [ ] Complete vendor registration form
- [ ] Product catalog API
- [ ] Basic RFQ creation (manual entry)

### Phase 2: Core Features
- [ ] File upload for RFQ (Excel/PDF/Image)
- [ ] OCR integration with OpenAI GPT-4 Vision
- [ ] Vendor bidding interface
- [ ] Admin bid review and selection
- [ ] Quotation generation and sending

### Phase 3: Order Management
- [ ] Order creation from accepted quotations
- [ ] Payment tracking (escrow)
- [ ] Vendor PO generation
- [ ] QA inspection interface
- [ ] Order status tracking

### Phase 4: Advanced Features
- [ ] Buy Again predictive analytics
- [ ] Smart consolidation algorithm
- [ ] Email notifications
- [ ] PDF generation (invoices, quotations)
- [ ] Advanced search and filtering

### Phase 5: Production Readiness
- [ ] Comprehensive testing
- [ ] Production deployment
- [ ] Performance optimization
- [ ] Security audit
- [ ] User documentation

## 💡 Development Notes

### Password Hashing
Currently using SHA-256 for compatibility with Web Crypto API. For production, consider:
- Switching to bcrypt if deploying to Node.js environment
- Using Cloudflare's built-in crypto APIs if staying on Workers

### Database
- Local development uses SQLite in `.wrangler/state/v3/d1`
- Production will use Cloudflare D1 (globally distributed SQLite)
- Migrations are version-controlled in `migrations/` directory

### API Design
- RESTful endpoints
- Consistent response format: `{ success, message, message_ar, data, error, error_ar }`
- JWT tokens in Authorization header: `Bearer <token>`

## 🤝 Contributing

This is a proprietary project. Contributions are managed internally.

## 📄 License

Proprietary - All Rights Reserved © 2026 lesorce

## 📞 Support

For technical support or questions:
- Email: support@lesorce.com
- Website: https://lesorce.com

---

**Built with ❤️ for Egyptian B2B enterprises**

Last Updated: January 4, 2026
Version: 0.1.0-MVP
