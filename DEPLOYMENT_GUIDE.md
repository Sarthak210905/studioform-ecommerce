# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Configuration Updates Required

1. **Frontend Environment Variables** (`frontend/.env.production`)
```env
VITE_API_URL=https://your-api-domain.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

2. **Backend Environment Variables** (`backend/.env`)
```env
# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/premium-desk-accessories?retryWrites=true&w=majority

# Security
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Payment Gateway
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_live_secret

# Shipping
DELHIVERY_API_KEY=your_production_key
DELHIVERY_API_URL=https://track.delhivery.com/api/cmu/create.json

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@your-domain.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Code Configuration**
- [ ] WhatsApp number in `frontend/src/pages/ProductDetail.tsx` (line 199)
- [ ] Real testimonials in `frontend/src/components/common/Testimonials.tsx`
- [ ] Sitemap BASE_URL in `frontend/src/utils/generateSitemap.ts`
- [ ] Social media links in `frontend/src/components/layout/Footer.tsx`

### ✅ Build & Test

#### Frontend
```powershell
cd frontend

# Install dependencies
npm install

# Run type check
npm run type-check

# Build for production
npm run build

# Preview production build (optional)
npm run preview
```

#### Backend
```powershell
cd backend

# Install dependencies
pip install -r requirements.txt

# Test MongoDB connection
python -c "from app.db.mongodb import connect_db; import asyncio; asyncio.run(connect_db())"

# Run backend (test)
uvicorn app.main:app --reload
```

## Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

#### Frontend - Vercel
1. Push code to GitHub
2. Go to https://vercel.com
3. Import repository
4. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Add `VITE_API_URL`
5. Deploy

#### Backend - Render
1. Go to https://render.com
2. New → Web Service
3. Connect repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment Variables: Add all backend vars
5. Deploy

### Option 2: Railway (Full Stack)

#### Frontend
```powershell
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd frontend
railway init

# Add environment variables
railway variables set VITE_API_URL=https://your-backend.railway.app

# Deploy
railway up
```

#### Backend
```powershell
cd backend
railway init
railway variables set MONGODB_URL=xxx
railway variables set SECRET_KEY=xxx
# ... add all environment variables
railway up
```

### Option 3: VPS (DigitalOcean, AWS EC2, etc.)

#### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install Nginx
sudo apt install -y nginx

# Install Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

#### Backend Deployment
```bash
# Create app directory
sudo mkdir -p /var/www/premium-desk-api
cd /var/www/premium-desk-api

# Clone repo
git clone https://github.com/yourusername/premium-desk-accessories.git .

# Setup Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Install Gunicorn
pip install gunicorn

# Create systemd service
sudo nano /etc/systemd/system/premium-desk-api.service
```

**Service file:**
```ini
[Unit]
Description=Premium Desk Accessories API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/premium-desk-api/backend
Environment="PATH=/var/www/premium-desk-api/venv/bin"
ExecStart=/var/www/premium-desk-api/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl daemon-reload
sudo systemctl start premium-desk-api
sudo systemctl enable premium-desk-api
```

#### Frontend Deployment
```bash
# Build locally
cd frontend
npm install
npm run build

# Upload to server
scp -r dist/* user@your-server:/var/www/premium-desk-frontend/

# Or build on server
cd /var/www/premium-desk-frontend
npm install
npm run build
```

#### Nginx Configuration
```nginx
# Backend
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/premium-desk-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/premium-desk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificates
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com
```

## Post-Deployment Tasks

### 1. DNS Configuration
- **Frontend**: Point A record to server IP or CNAME to Vercel
- **Backend**: Point subdomain (api.your-domain.com) to backend server
- **Wait**: DNS propagation (5-60 minutes)

### 2. SSL/HTTPS
- Vercel/Render: Automatic SSL ✅
- VPS: Use Certbot (shown above)

### 3. SEO & Analytics

#### Google Search Console
1. Go to https://search.google.com/search-console
2. Add property: your-domain.com
3. Verify ownership (DNS TXT record or HTML file)
4. Submit sitemap: https://your-domain.com/sitemap.xml

#### Google Analytics 4
1. Go to https://analytics.google.com
2. Create property
3. Get measurement ID (G-XXXXXXXXXX)
4. Add to `frontend/.env.production`
5. Redeploy frontend

#### Microsoft Clarity (Free!)
1. Go to https://clarity.microsoft.com
2. Create project
3. Copy tracking code
4. Add to `frontend/index.html` before `</head>`:
```html
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
</script>
```

### 4. Generate Sitemap
Create backend endpoint:
```python
# backend/app/api/routes/seo.py
from fastapi import APIRouter
from fastapi.responses import Response
from app.models.product import Product

router = APIRouter()

@router.get("/sitemap.xml")
async def get_sitemap():
    products = await Product.find_all().to_list()
    
    urls = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '<url><loc>https://your-domain.com/</loc><priority>1.0</priority></url>',
        '<url><loc>https://your-domain.com/products</loc><priority>0.9</priority></url>',
    ]
    
    for product in products:
        urls.append(f'<url><loc>https://your-domain.com/products/{product.id}</loc><priority>0.8</priority></url>')
    
    urls.append('</urlset>')
    sitemap = '\n'.join(urls)
    
    return Response(content=sitemap, media_type="application/xml")
```

### 5. Error Tracking (Sentry - Optional)
```powershell
# Frontend
npm install @sentry/react

# Add to frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### 6. Database Backups
```bash
# MongoDB Atlas: Automatic backups enabled ✅
# Or manual backup:
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Setup cron job
crontab -e
# Add: 0 2 * * * mongodump --uri="xxx" --out=/backups/$(date +\%Y\%m\%d)
```

### 7. Monitoring

#### Uptime Monitoring (Free)
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com

#### Performance
- Google PageSpeed Insights: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com
- WebPageTest: https://www.webpagetest.org

## Testing Checklist

### Functionality
- [ ] Homepage loads
- [ ] Products page loads with filters
- [ ] Product detail page
- [ ] Add to cart works
- [ ] Checkout flow complete
- [ ] Payment gateway (Razorpay)
- [ ] Order confirmation email
- [ ] User registration/login
- [ ] Admin panel access
- [ ] Shipping calculation
- [ ] Coupon codes
- [ ] Wishlist
- [ ] Reviews
- [ ] Search

### Mobile Testing
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Tablet view
- [ ] Touch targets (48px min)
- [ ] Sticky action bar
- [ ] WhatsApp button

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Images optimized (WebP)
- [ ] Lazy loading working

### SEO
- [ ] Meta tags on all pages
- [ ] Structured data (Schema.org)
- [ ] Sitemap accessible
- [ ] Robots.txt
- [ ] SSL certificate
- [ ] Mobile-friendly test

### Security
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] JWT secrets strong
- [ ] Environment variables not exposed
- [ ] SQL injection prevented (MongoDB)
- [ ] XSS protection

## Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Update `ALLOWED_ORIGINS` in backend `.env`
```python
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Issue: API Calls Failing
**Solution**: Check `VITE_API_URL` in frontend
```env
VITE_API_URL=https://api.your-domain.com
```

### Issue: Images Not Loading
**Solution**: 
1. Check Cloudinary credentials
2. Verify image URLs are absolute
3. Check CORS on Cloudinary

### Issue: Payment Gateway Not Working
**Solution**:
1. Use Razorpay LIVE keys (not TEST)
2. Verify webhook URL: `https://api.your-domain.com/api/payment/webhook`
3. Check Razorpay dashboard logs

### Issue: Emails Not Sending
**Solution**:
1. Use Gmail App Password (not regular password)
2. Enable "Less secure app access" (if using Gmail)
3. Or use SendGrid/AWS SES for production

## Rollback Plan

If deployment fails:
```bash
# Git rollback
git revert HEAD
git push

# Or restore previous version
git checkout previous-tag
git push --force

# Backend: Restart service
sudo systemctl restart premium-desk-api

# Frontend: Redeploy previous build
```

## Maintenance

### Weekly
- [ ] Check error logs
- [ ] Review analytics
- [ ] Monitor uptime
- [ ] Check heat maps (Clarity)

### Monthly
- [ ] Update dependencies
- [ ] Database backup verification
- [ ] Security audit
- [ ] Performance review

### As Needed
- [ ] Add new products
- [ ] Update testimonials
- [ ] Create blog posts
- [ ] Run A/B tests

---

## Quick Deploy Commands

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Render)
```bash
git push origin main
# Auto-deploys via Render webhook
```

### Full Stack (Railway)
```bash
railway up
```

---

**Last Updated**: February 4, 2026
**Status**: ✅ Ready for Production

**Good luck with your launch! 🚀**
