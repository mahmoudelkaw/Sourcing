# Sourssing - Deployment Guide

This guide explains how to deploy Sourssing to production on Cloudflare Pages.

## 📋 Prerequisites

1. **Cloudflare Account** with Pages enabled
2. **Wrangler CLI** installed: `npm install -g wrangler`
3. **Cloudflare API Token** from Cloudflare Dashboard
4. **Git Repository** (GitHub, GitLab, or Bitbucket)

## 🚀 Quick Deployment (Recommended)

### Step 1: Setup Cloudflare Authentication

```bash
# Login to Cloudflare
wrangler login

# Or use API token
export CLOUDFLARE_API_TOKEN=your-api-token-here
```

### Step 2: Create Production D1 Database

```bash
# Create D1 database
wrangler d1 create sourssing-production

# Copy the database_id from output and update wrangler.jsonc
```

Update `wrangler.jsonc`:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "sourssing-production",
      "database_id": "your-actual-database-id-here"  // Replace this!
    }
  ]
}
```

### Step 3: Apply Database Migrations to Production

```bash
# Apply migrations to remote database
npm run db:migrate:prod

# Or manually
wrangler d1 migrations apply sourssing-production
```

### Step 4: Deploy to Cloudflare Pages

```bash
# Build and deploy
npm run deploy

# Or step-by-step
npm run build
wrangler pages deploy dist --project-name sourssing
```

## 🔐 Environment Variables (Production)

Set these secrets in Cloudflare Pages dashboard or via CLI:

```bash
# Set JWT secret
wrangler pages secret put JWT_SECRET --project-name sourssing
# Enter: your-super-secret-production-jwt-key-min-32-chars

# Set JWT expiry
wrangler pages secret put JWT_EXPIRY --project-name sourssing
# Enter: 7d

# Set OpenAI API key (for OCR - when implemented)
wrangler pages secret put OPENAI_API_KEY --project-name sourssing
# Enter: sk-your-openai-api-key

# Set app configuration
wrangler pages secret put APP_NAME --project-name sourssing
# Enter: Sourssing

wrangler pages secret put APP_URL --project-name sourssing
# Enter: https://sourssing.pages.dev

wrangler pages secret put MARKUP_PERCENTAGE --project-name sourssing
# Enter: 7.0
```

## 🌐 Custom Domain Setup

### Via Cloudflare Dashboard
1. Go to Cloudflare Pages → Your Project → Custom Domains
2. Add your domain (e.g., sourssing.com)
3. Follow DNS setup instructions
4. Wait for SSL certificate provisioning (~15 minutes)

### Via CLI
```bash
wrangler pages domain add sourssing.com --project-name sourssing
```

## 🗄️ Database Management

### View Production Database
```bash
# List all D1 databases
wrangler d1 list

# Query production database
wrangler d1 execute sourssing-production --command="SELECT * FROM users"

# Interactive SQL console
wrangler d1 execute sourssing-production
```

### Backup Production Database
```bash
# Export database
wrangler d1 export sourssing-production --output=backup.sql

# Import to local for testing
wrangler d1 execute sourssing-production --local --file=backup.sql
```

## 📊 Monitoring & Logs

### View Deployment Logs
```bash
# Via dashboard: Pages → Your Project → Deployments → View Build Logs

# Or use wrangler
wrangler pages deployments list --project-name sourssing
```

### View Runtime Logs
```bash
# Real-time logs
wrangler pages tail --project-name sourssing

# Filter by status code
wrangler pages tail --project-name sourssing --status=error
```

## 🔄 Continuous Deployment (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist --project-name sourssing
```

## 🧪 Testing Production

### Health Check Endpoints
```bash
# Homepage
curl https://sourssing.pages.dev

# API health
curl https://sourssing.pages.dev/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Arabic version
curl https://sourssing.pages.dev?lang=ar
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 https://sourssing.pages.dev
```

## 🚨 Rollback

### Rollback to Previous Deployment
```bash
# List deployments
wrangler pages deployments list --project-name sourssing

# Rollback to specific deployment
wrangler pages deployment rollback <deployment-id> --project-name sourssing
```

### Emergency Rollback via Dashboard
1. Go to Cloudflare Pages → Your Project → Deployments
2. Find stable deployment
3. Click "Rollback to this deployment"

## 📈 Performance Optimization

### Enable Caching
Add to your `wrangler.jsonc`:
```jsonc
{
  "rules": [
    {
      "pattern": "/static/*",
      "cache": true
    }
  ]
}
```

### Enable Compression
Cloudflare Pages automatically enables Brotli/Gzip compression.

### Edge Caching Strategy
- Static assets: 1 year cache (`/static/*`)
- API responses: No cache by default
- HTML pages: Short cache with revalidation

## 🔒 Security Checklist

- [ ] Change all default passwords in production database
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Enable rate limiting (Cloudflare WAF)
- [ ] Set up DDoS protection (Cloudflare default)
- [ ] Configure CORS properly for production domains
- [ ] Enable bot protection (Cloudflare Bot Management)
- [ ] Set up SSL/TLS (Auto-enabled by Cloudflare)
- [ ] Configure CSP headers (Content Security Policy)
- [ ] Enable audit logging
- [ ] Set up monitoring alerts

## 🆘 Troubleshooting

### Deployment Fails
```bash
# Check wrangler version
wrangler --version

# Verify authentication
wrangler whoami

# Check project config
wrangler pages project list
```

### Database Connection Issues
```bash
# Test D1 connection
wrangler d1 execute sourssing-production --command="SELECT 1"

# Check binding in wrangler.jsonc
cat wrangler.jsonc | grep -A 5 "d1_databases"
```

### 500 Errors in Production
1. Check logs: `wrangler pages tail --project-name sourssing`
2. Verify environment variables are set
3. Check database migrations applied
4. Review recent code changes

## 📞 Support Contacts

- **Cloudflare Support**: https://dash.cloudflare.com/support
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Community Discord**: https://discord.gg/cloudflaredev

---

**Last Updated**: January 4, 2026
