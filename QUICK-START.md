# ⚡ Sourssing - Quick Start Guide

Get up and running in 5 minutes!

---

## 🎯 What Is This?

**Sourssing** is a complete B2B procurement platform for Egyptian enterprises. This MVP includes:
- ✅ Working authentication system
- ✅ 24-table database with 50+ products
- ✅ Bilingual UI (Arabic + English)
- ✅ SEO-optimized landing page
- ✅ Deploy-ready on Cloudflare Pages

---

## 🚀 Option 1: View Live Demo (Fastest)

**Already running!** Just visit:

👉 **https://3000-imt8bnzh9fjq3e1fmww7u-8f57ffe2.sandbox.novita.ai**

### Test Accounts:
- **Admin**: admin@sourssing.com / admin123
- **Buyer**: buyer@company.com / admin123
- **Vendor**: vendor@supplier.com / admin123

### Try These:
1. Visit homepage → See bilingual landing page
2. Click "Login" → Test authentication
3. Toggle language (top right) → See Arabic version
4. View `/api/auth/login` → Test API directly

---

## 💻 Option 2: Run Locally

### Prerequisites
- Node.js 18+ installed
- That's it!

### Steps

```bash
# 1. Navigate to project
cd /home/user/webapp

# 2. Install dependencies (if needed)
npm install

# 3. Build project
npm run build

# 4. Start server
npm run clean-port
pm2 start ecosystem.config.cjs

# 5. Visit
open http://localhost:3000
```

### Verify It's Running

```bash
# Check PM2 status
pm2 list

# Test homepage
curl http://localhost:3000

# Test login API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sourssing.com","password":"admin123"}'
```

---

## 📖 Option 3: Read First, Run Later

### 5-Minute Reading Path

1. **Start here**: `README.md` - Full overview
2. **Understand architecture**: `DELIVERY-SUMMARY.md` - What's built
3. **Deploy to production**: `DEPLOYMENT.md` - Cloudflare guide

### Project Structure

```
webapp/
├── README.md              ← Start here (10-minute read)
├── DELIVERY-SUMMARY.md    ← What's been built (5-minute read)
├── DEPLOYMENT.md          ← How to deploy (production guide)
├── src/index.tsx          ← Main app code (beautiful landing page)
├── src/routes/auth.ts     ← Authentication API (login/register)
├── migrations/*.sql       ← Database schema (24 tables)
└── .dev.vars              ← Environment variables
```

---

## 🎯 Common Tasks

### Start/Stop Server

```bash
# Start
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs

# Stop
pm2 stop sourssing

# Restart
pm2 restart sourssing

# Logs
pm2 logs sourssing --nostream
```

### Database Operations

```bash
# View users
npx wrangler d1 execute sourssing-production --local \
  --command="SELECT email, role, status FROM users"

# View products (50+ items)
npx wrangler d1 execute sourssing-production --local \
  --command="SELECT name, name_ar, base_price FROM products LIMIT 10"

# Add new admin
npx wrangler d1 execute sourssing-production --local \
  --command="INSERT INTO users (email, password_hash, role, status) VALUES ('you@company.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'active')"
```

### Test API Endpoints

```bash
# Login (get token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sourssing.com","password":"admin123"}' | jq

# Register new buyer
curl -X POST http://localhost:3000/api/auth/register/buyer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newbuyer@test.com",
    "password": "password123",
    "company_name": "Test Company",
    "tax_id": "999-888-777",
    "address": "123 Test St",
    "city": "Cairo",
    "contact_person": "John Doe",
    "phone": "+201234567890"
  }' | jq
```

---

## 🚀 Deploy to Production

### One-Command Deploy (after Cloudflare setup)

```bash
npm run deploy
```

### First-Time Setup

```bash
# 1. Install Wrangler
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Create database
wrangler d1 create sourssing-production
# Copy database_id and update wrangler.jsonc

# 4. Apply migrations
npm run db:migrate:prod

# 5. Deploy
npm run deploy
```

Full guide: See `DEPLOYMENT.md`

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
npm run clean-port
# Or manually:
fuser -k 3000/tcp
```

### PM2 Not Found

```bash
npm install -g pm2
```

### Database Empty

```bash
# Reapply migrations
npm run db:migrate:local
```

### Build Fails

```bash
# Clean and rebuild
rm -rf dist .wrangler
npm run build
```

---

## 📚 Learn More

### Documentation Files
- `README.md` - Complete project documentation
- `DELIVERY-SUMMARY.md` - What's been delivered
- `DEPLOYMENT.md` - Production deployment guide
- `QUICK-START.md` - This file

### Code Files
- `src/index.tsx` - Main app + landing page
- `src/routes/auth.ts` - Authentication API
- `src/lib/jwt.ts` - JWT implementation
- `src/lib/i18n.ts` - Bilingual translation system
- `src/lib/db.ts` - Database utilities
- `migrations/` - Database schema

### Key Technologies
- **Hono**: https://hono.dev (web framework)
- **Cloudflare D1**: https://developers.cloudflare.com/d1 (database)
- **TailwindCSS**: https://tailwindcss.com (styling)
- **Wrangler**: https://developers.cloudflare.com/workers/wrangler (CLI)

---

## ✅ What's Working Right Now

- ✅ Beautiful bilingual landing page
- ✅ Login page with live API
- ✅ Authentication API (login, register)
- ✅ Database with 50+ products
- ✅ 3 test accounts (admin, buyer, vendor)
- ✅ PM2 process management
- ✅ SEO optimization
- ✅ Responsive design
- ✅ Arabic + English support

---

## 🎯 Next Steps

After exploring the MVP, you can:

1. **Build Buyer Portal** - Dashboard, catalog, RFQ creation
2. **Build Vendor Portal** - Bid submission, orders
3. **Build Admin Portal** - User approval, RFQ management
4. **Add File Upload** - Excel/PDF/Image for RFQs
5. **Integrate OpenAI** - OCR for extracting items from uploads
6. **Deploy to Production** - Cloudflare Pages

---

## 💡 Tips

- Use **admin@sourssing.com** to test admin features
- Password for all test accounts: `admin123`
- Change `?lang=ar` to see Arabic version
- Check `pm2 logs` if something breaks
- Database is in `.wrangler/state/v3/d1/` (local)

---

## 🆘 Need Help?

1. Check `README.md` for detailed docs
2. Read `DELIVERY-SUMMARY.md` for what's built
3. Review error logs: `pm2 logs sourssing`
4. Test database: `npm run db:console:local`

---

**That's it! You're ready to go.** 🎉

Start exploring: **https://3000-imt8bnzh9fjq3e1fmww7u-8f57ffe2.sandbox.novita.ai**
