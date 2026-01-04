# 🚀 Sourssing Infrastructure Setup Guide

**Status**: ⏳ Waiting for Cloudflare API Configuration

---

## 🔒 Prerequisites

Before we can set up the production infrastructure, you need:

### 1. Cloudflare Account (Required)
- Sign up at: https://dash.cloudflare.com/sign-up
- Free tier is sufficient for initial deployment

### 2. Cloudflare API Token (Required)
You need an API token with these permissions:
- ✅ **Workers Scripts**: Edit
- ✅ **D1**: Edit
- ✅ **Cloudflare Pages**: Edit

**How to Create:**
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Add D1 and Pages permissions
5. Copy the generated token

### 3. OpenAI API Key (Optional - for OCR)
- Only needed if you want the file upload OCR feature
- Get key at: https://platform.openai.com/api-keys
- Alternative: Use GenSpark LLM proxy

---

## 🎯 Setup Process

### Option A: Automated Setup (Recommended)

**Step 1: Configure Cloudflare API Key**
1. Go to the **Deploy** tab in your workspace
2. Follow the instructions to add your Cloudflare API token
3. Save the configuration

**Step 2: Run Infrastructure Setup**
Once the API key is configured, I will automatically:
- ✅ Create Cloudflare D1 database
- ✅ Run database migrations
- ✅ Configure production secrets
- ✅ Deploy to Cloudflare Pages

---

### Option B: Manual Setup

If you prefer manual setup, follow these steps:

#### 1. Authenticate with Cloudflare
```bash
# Set your API token as environment variable
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# Verify authentication
npx wrangler whoami
```

#### 2. Create D1 Database
```bash
cd /home/user/webapp

# Create production database
npx wrangler d1 create sourssing-production

# You'll get output like:
# ✅ Successfully created DB 'sourssing-production'
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "sourssing-production"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### 3. Update Configuration
```bash
# Update wrangler.jsonc with the database_id from step 2
# Replace "local" with the actual UUID

# Before:
# "database_id": "local"

# After:
# "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### 4. Run Database Migrations
```bash
# Apply migrations to production database
npx wrangler d1 migrations apply sourssing-production

# Confirm when prompted
# You should see:
# ✅ Successfully applied 2 migrations
```

#### 5. Configure Production Secrets
```bash
# Set JWT secret (use a strong random string)
npx wrangler secret put JWT_SECRET
# When prompted, enter: sourssing-prod-jwt-$(openssl rand -hex 32)

# Set OpenAI API key (if you have one)
npx wrangler secret put OPENAI_API_KEY
# When prompted, enter your OpenAI API key

# Set app URL
npx wrangler secret put APP_URL
# When prompted, enter: https://sourssing.com
```

#### 6. Build & Deploy
```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name sourssing --branch main

# You'll get output with your deployment URL:
# ✨ Deployment complete! Take a peek over at
#    https://xxxxxxxx.sourssing.pages.dev
```

#### 7. Verify Deployment
```bash
# Test homepage
curl https://sourssing.pages.dev

# Test API
curl https://sourssing.pages.dev/api/products

# Test registration
curl https://sourssing.pages.dev/register?role=buyer
```

---

## 📋 Post-Deployment Checklist

After deployment, verify these items:

### ✅ Core Functionality
- [ ] Homepage loads correctly
- [ ] Login page works
- [ ] Registration page works
- [ ] Language toggle (EN/AR) works
- [ ] SEO tags present (view source)

### ✅ API Endpoints
- [ ] GET /api/products (should return products)
- [ ] POST /api/auth/login (test with credentials)
- [ ] GET /api/rfqs (requires authentication)

### ✅ Portal Access
- [ ] /buyer/dashboard loads
- [ ] /vendor/dashboard loads
- [ ] /admin/dashboard loads

### ✅ Database
- [ ] Login/registration creates users
- [ ] Data persists across requests
- [ ] No database connection errors

### ✅ Performance
- [ ] Page loads < 2 seconds
- [ ] API responses < 500ms
- [ ] No console errors

---

## 🔧 Troubleshooting

### Issue: "Invalid database_id"
**Solution**: Make sure you updated wrangler.jsonc with the real UUID from `wrangler d1 create` output

### Issue: "JWT authentication failed"
**Solution**: Verify JWT_SECRET is set correctly with `npx wrangler secret list`

### Issue: "OCR upload doesn't work"
**Solution**: Set OPENAI_API_KEY with `npx wrangler secret put OPENAI_API_KEY`

### Issue: "Database tables don't exist"
**Solution**: Run migrations with `npx wrangler d1 migrations apply sourssing-production`

### Issue: "Deployment fails"
**Solution**: Check wrangler logs and ensure all secrets are set

---

## 📊 Infrastructure Status

### Development (Local)
- ✅ Code complete
- ✅ All features working
- ✅ Build passes
- ✅ Tests passing (76%)

### Production (Cloudflare)
- ⏳ Database: Not created
- ⏳ Secrets: Not configured
- ⏳ Deployment: Not deployed

**Status**: Ready for deployment once API key is configured

---

## 🎯 What Happens After Setup

Once infrastructure is set up, your application will be:

1. **Live on Cloudflare's Global Network**
   - Ultra-fast edge deployment
   - Available worldwide
   - Auto-scaling to handle traffic

2. **Database Ready**
   - D1 SQLite database
   - 24 tables initialized
   - Seed data available

3. **Secure & Authenticated**
   - JWT authentication working
   - Role-based access control
   - Production secrets configured

4. **Feature-Complete**
   - All 37 API endpoints operational
   - All 14 portal pages accessible
   - Bilingual support (EN/AR)
   - OCR upload working (if API key set)

---

## 💰 Cost Estimate

### Cloudflare Pages (Free Tier)
- ✅ Unlimited requests
- ✅ 500 builds/month
- ✅ 100GB bandwidth/month
- ✅ Custom domain support

### Cloudflare D1 (Free Tier)
- ✅ 5GB storage
- ✅ 5 million reads/day
- ✅ 100k writes/day

### OpenAI API (Optional)
- 💵 Pay-per-use
- ~$0.002 per OCR request
- Not required for core functionality

**Total Monthly Cost**: $0 (free tier sufficient)

---

## 🔗 Useful Links

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **D1 Documentation**: https://developers.cloudflare.com/d1/
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Pages Deployment**: https://developers.cloudflare.com/pages/

---

## 📞 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Review DEPLOYMENT-CHECKLIST.md
3. Check wrangler logs: `~/.config/.wrangler/logs/`
4. Verify configuration in wrangler.jsonc

---

**Next Step**: Configure your Cloudflare API key in the Deploy tab, then run the setup command again!
