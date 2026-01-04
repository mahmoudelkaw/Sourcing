# Sourssing MVP - Testing & Development Guide

## Table of Contents
1. [Quick Start Testing](#quick-start-testing)
2. [Automated Testing](#automated-testing)
3. [Manual Testing](#manual-testing)
4. [API Testing Examples](#api-testing-examples)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Development Workflow](#development-workflow)

---

## Quick Start Testing

### Prerequisites
```bash
# Ensure server is running
pm2 list

# If not running, start it
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs

# Check status
pm2 logs sourssing --nostream | tail -10
```

### Run All Tests
```bash
# Make test script executable (first time only)
chmod +x test-api.sh

# Run all automated tests
./test-api.sh

# Expected output: 19/25 tests passing
```

---

## Automated Testing

### Test Script (`test-api.sh`)
Comprehensive test coverage across all major endpoints:

**Test Categories:**
1. **Authentication** (5 tests)
   - Admin login
   - Buyer login  
   - Vendor login
   - Get user profile
   - Invalid login rejection

2. **Products API** (4 tests)
   - List products with pagination
   - Get product by ID
   - List categories
   - Search products

3. **RFQs** (4 tests)
   - Create RFQ (buyer)
   - List RFQs (buyer)
   - Get RFQ by ID
   - Submit RFQ

4. **Bids** (2 tests)
   - List available RFQs (vendor)
   - Submit bid (vendor)

5. **Admin** (2 tests)
   - List all users
   - List all RFQs

6. **Landing Pages** (2 tests)
   - English homepage
   - Arabic homepage (RTL)

7. **Portal Pages** (4 tests)
   - Buyer dashboard
   - Vendor dashboard
   - Admin dashboard
   - Catalog (Arabic)

### Running Specific Test Categories

```bash
# Run only authentication tests
curl -s -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@sourssing.com","password":"admin123"}'

# Test products endpoint
curl -s "http://localhost:3000/api/products?page=1&limit=5"

# Test Arabic language
curl -s "http://localhost:3000/?lang=ar" | grep 'lang="ar"'
```

---

## Manual Testing

### Test Accounts
| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@sourssing.com | admin123 | Full platform control |
| **Buyer** | buyer@company.com | admin123 | Browse, create RFQs, orders |
| **Vendor** | vendor@supplier.com | admin123 | View RFQs, submit bids |

### Complete User Journey Testing

#### 1. Buyer Journey
```bash
# Step 1: Login as buyer
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@company.com","password":"admin123"}'

# Save token from response
BUYER_TOKEN="<token_from_response>"

# Step 2: Browse products
curl http://localhost:3000/api/products?page=1&limit=10

# Step 3: Create RFQ
curl -X POST http://localhost:3000/api/rfqs \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Office Supplies Order",
    "title_ar": "طلب مستلزمات مكتبية",
    "description": "Need office supplies for new branch",
    "delivery_address": "123 Business St, Cairo",
    "delivery_address_ar": "123 شارع الأعمال، القاهرة",
    "required_delivery_date": "2026-02-15",
    "items": [
      {
        "item_name": "A4 Paper",
        "item_name_ar": "ورق A4",
        "quantity": 50,
        "unit": "ream",
        "unit_ar": "رزمة",
        "brand": "Double A",
        "brand_ar": "دبل إيه",
        "specifications": "80gsm white paper"
      }
    ]
  }'

# Step 4: View my RFQs
curl http://localhost:3000/api/rfqs \
  -H "Authorization: Bearer $BUYER_TOKEN"

# Step 5: Submit RFQ (change status from draft to submitted)
curl -X POST http://localhost:3000/api/rfqs/<rfq_id>/submit \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

#### 2. Vendor Journey
```bash
# Step 1: Login as vendor
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@supplier.com","password":"admin123"}'

VENDOR_TOKEN="<token_from_response>"

# Step 2: View available RFQs
curl http://localhost:3000/api/bids/rfqs/available?page=1&limit=10 \
  -H "Authorization: Bearer $VENDOR_TOKEN"

# Step 3: Submit bid
curl -X POST http://localhost:3000/api/bids \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rfq_id": <rfq_id>,
    "delivery_time_days": 7,
    "notes": "We can deliver within 1 week",
    "items": [
      {
        "rfq_item_id": <item_id>,
        "unit_price": 250.00,
        "total_price": 12500.00
      }
    ]
  }'

# Step 4: View my bids
curl http://localhost:3000/api/bids/my-bids \
  -H "Authorization: Bearer $VENDOR_TOKEN"
```

#### 3. Admin Journey
```bash
# Step 1: Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sourssing.com","password":"admin123"}'

ADMIN_TOKEN="<token_from_response>"

# Step 2: View all users
curl http://localhost:3000/api/admin/users?page=1&limit=20 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Step 3: Approve user
curl -X PUT http://localhost:3000/api/admin/users/<user_id>/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Step 4: View RFQ with bids
curl http://localhost:3000/api/admin/rfqs/<rfq_id> \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Step 5: Accept winning bid
curl -X PUT http://localhost:3000/api/admin/bids/<bid_id>/accept \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Step 6: View payments
curl http://localhost:3000/api/payments \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Step 7: Verify payment
curl -X PUT http://localhost:3000/api/payments/<payment_id>/verify \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Step 8: Release payment to vendor
curl -X POST http://localhost:3000/api/payments/<payment_id>/release \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## API Testing Examples

### Authentication

#### Login (Success)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@company.com",
    "password": "admin123"
  }'

# Response:
# {
#   "success": true,
#   "message": "Login successful",
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": { "id": 2, "email": "buyer@company.com", "role": "buyer" },
#     "profile": { ... }
#   }
# }
```

#### Login (Failed)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@email.com",
    "password": "wrongpass"
  }'

# Response:
# {
#   "success": false,
#   "error": "Invalid credentials",
#   "error_ar": "بيانات تسجيل دخول غير صحيحة"
# }
```

### Products

#### List Products (with pagination)
```bash
curl "http://localhost:3000/api/products?page=1&limit=5&category=1"

# Response:
# {
#   "success": true,
#   "data": {
#     "products": [
#       {
#         "id": 1,
#         "name": "A4 Copy Paper 80gsm",
#         "name_ar": "ورق طباعة A4 وزن 80 جرام",
#         "sku": "PAPER-A4-80GSM",
#         "brand": "Double A",
#         "base_price": 200,
#         "moq": 10,
#         ...
#       }
#     ],
#     "pagination": {
#       "page": 1,
#       "limit": 5,
#       "total": 50,
#       "totalPages": 10
#     }
#   }
# }
```

### File Upload & OCR

#### Upload and Extract Data from Image
```bash
# First, encode image to base64
IMAGE_BASE64=$(base64 -w 0 invoice.jpg)

curl -X POST http://localhost:3000/api/upload/ocr \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"fileData\": \"data:image/jpeg;base64,$IMAGE_BASE64\",
    \"fileName\": \"invoice.jpg\"
  }"

# Response:
# {
#   "success": true,
#   "data": {
#     "items": [
#       {
#         "item_name": "Notebook A5",
#         "item_name_ar": "دفتر ملاحظات A5",
#         "quantity": 100,
#         "unit": "piece",
#         "unit_ar": "قطعة",
#         ...
#       }
#     ]
#   }
# }
```

---

## Common Issues & Solutions

### Issue 1: Login Fails with "An error occurred during login"
**Cause**: JWT_SECRET not set in environment variables

**Solution**:
```bash
# Check .dev.vars file
cat .dev.vars

# Should contain:
# JWT_SECRET=sourssing-super-secret-jwt-key-change-in-production-2026
# JWT_EXPIRY=7d

# If missing, add them and restart
pm2 restart sourssing --update-env
```

### Issue 2: "Unauthorized - Invalid or expired token"
**Cause**: Token expired (7 days) or invalid

**Solution**:
```bash
# Login again to get new token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@company.com","password":"admin123"}'

# Use the new token in subsequent requests
```

### Issue 3: Port 3000 already in use
**Solution**:
```bash
# Kill process on port 3000
fuser -k 3000/tcp

# Or use PM2
pm2 delete all
pm2 start ecosystem.config.cjs
```

### Issue 4: Database not found / empty
**Solution**:
```bash
# Apply migrations
npm run db:migrate:local

# Seed database
npm run db:seed

# Check if data exists
npm run db:console:local
# Then run: SELECT COUNT(*) FROM products;
```

### Issue 5: Language toggle not working
**Solution**:
```bash
# Make sure URL parameter is set
http://localhost:3000/buyer/catalog?lang=ar

# Check HTML output
curl -s "http://localhost:3000/buyer/catalog?lang=ar" | grep 'lang='
# Should show: <html lang="ar" dir="rtl">
```

---

## Development Workflow

### 1. Start Development Server
```bash
cd /home/user/webapp

# Build first
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs

# Watch logs
pm2 logs sourssing --lines 50
```

### 2. Make Changes
```bash
# Edit code
vim src/routes/auth.ts

# Rebuild
npm run build

# Restart server (with updated environment)
pm2 restart sourssing --update-env

# Test changes
curl http://localhost:3000/api/auth/login ...
```

### 3. Test Changes
```bash
# Run automated tests
./test-api.sh

# Or test specific endpoint
curl -X POST http://localhost:3000/api/...
```

### 4. Commit Changes
```bash
# Add files
git add .

# Commit with descriptive message
git commit -m "Feature: Add new endpoint for XYZ"

# Push to GitHub (after setup_github_environment)
git push origin main
```

### 5. Deploy to Production
```bash
# Set up Cloudflare API key first
# (Call setup_cloudflare_api_key)

# Build production bundle
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name sourssing
```

---

## Testing Checklist

### Before Commit
- [ ] All automated tests pass (`./test-api.sh`)
- [ ] No console errors in browser
- [ ] All endpoints return correct status codes
- [ ] Validation works correctly
- [ ] Error messages are bilingual
- [ ] Arabic RTL layout works

### Before Deployment
- [ ] Environment variables set in .dev.vars
- [ ] Database migrations applied
- [ ] Seed data populated
- [ ] All tests passing
- [ ] Code documented
- [ ] Git commit clean
- [ ] README updated

### After Deployment
- [ ] Production URL accessible
- [ ] Login works
- [ ] All portals load correctly
- [ ] API endpoints functional
- [ ] Language switching works
- [ ] No console errors

---

## Performance Testing

### Load Testing Example
```bash
# Install Apache Bench (optional)
sudo apt-get install apache2-utils

# Test login endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:3000/api/auth/login

# Test products list (1000 requests)
ab -n 1000 -c 50 http://localhost:3000/api/products?limit=10
```

### Response Time Expectations
| Endpoint | Expected Response Time |
|----------|----------------------|
| Login | < 100ms |
| Products List | < 50ms |
| Create RFQ | < 200ms |
| OCR Upload | < 5000ms |
| Portal Pages | < 100ms |

---

## Debugging Tips

### Enable Verbose Logging
```bash
# Check PM2 logs
pm2 logs sourssing

# Check error logs only
pm2 logs sourssing --err

# Watch logs in real-time
pm2 logs sourssing --lines 100
```

### Test Database Queries
```bash
# Open D1 console
npm run db:console:local

# Run test queries
SELECT * FROM users LIMIT 5;
SELECT * FROM products WHERE is_active = 1;
SELECT COUNT(*) FROM rfqs;
```

### Test Language Switching
```bash
# English
curl -s http://localhost:3000/buyer/catalog?lang=en | grep '<html'

# Arabic (should show dir="rtl")
curl -s http://localhost:3000/buyer/catalog?lang=ar | grep '<html'
```

---

## Next Steps

After completing manual testing:
1. **Run full test suite**: `./test-api.sh`
2. **Fix any failing tests**
3. **Document any new issues**
4. **Deploy to staging** (Cloudflare Pages)
5. **Run tests on staging**
6. **Deploy to production** (if all tests pass)

---

## Support & Resources

- **GitHub**: [Your repo URL]
- **Documentation**: `/home/user/webapp/*.md`
- **Logs**: `pm2 logs sourssing`
- **Database**: `npm run db:console:local`

**Happy Testing! 🚀**
