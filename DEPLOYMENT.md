# 🚀 Deployment Guide

## Prerequisites

Before deploying, ensure you have:

- **Docker** and **Docker Compose** installed
- **MongoDB Atlas** account (or MongoDB server)
- **Cloudinary** account for image hosting
- **Razorpay** account for payment processing
- **SMTP** credentials (Gmail recommended)
- **Domain name** (for production)
- **SSL Certificate** (for HTTPS)

---

## 📋 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd premium-desk-accessories
```

### 2. Configure Environment Variables

#### Backend Configuration

```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit the file with your production values
nano backend/.env
```

**Important Settings to Update:**

```env
ENVIRONMENT=production
SECRET_KEY=<generate-with-openssl-rand-hex-32>
MONGODB_URL=<your-mongodb-atlas-url>
DATABASE_NAME=<your-database-name>

# Email Configuration
SMTP_USER=<your-email@gmail.com>
SMTP_PASSWORD=<your-app-specific-password>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Razorpay
RAZORPAY_KEY_ID=<your-live-key-id>
RAZORPAY_KEY_SECRET=<your-key-secret>

# CORS & Frontend
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Redis
USE_REDIS=true
REDIS_HOST=redis
```

#### Frontend Configuration

```bash
# Copy the example file
cp frontend/.env.example frontend/.env

# Edit the file
nano frontend/.env
```

```env
VITE_API_URL=https://api.yourdomain.com
VITE_RAZORPAY_KEY_ID=<your-live-key-id>
VITE_ENVIRONMENT=production
```

---

## 🐳 Docker Deployment

### Production Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Development Deployment

```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Using Deployment Scripts

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```cmd
deploy.bat
```

---

## 🌐 Production Server Setup

### 1. Server Requirements

- **OS**: Ubuntu 20.04+ or similar
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB+
- **Docker**: Latest version
- **Docker Compose**: Latest version

### 2. Install Docker

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 3. Clone and Configure

```bash
# Clone repository
git clone <your-repo-url>
cd premium-desk-accessories

# Configure environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with production values
nano backend/.env
nano frontend/.env
```

### 4. Deploy

```bash
# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

---

## 🔒 SSL/HTTPS Setup with Nginx

### Using Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx Configuration

Create `/etc/nginx/sites-available/premium-desk`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/premium-desk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Backup Database

```bash
# MongoDB Atlas - Use built-in backup
# Or export manually
docker exec -it premium-desk-backend python -c "from app.db.mongodb import backup_database; backup_database()"
```

---

## 🔧 Troubleshooting

### Container Not Starting

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Restart container
docker-compose restart backend
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :8000
sudo lsof -i :80

# Kill process
sudo kill -9 <PID>
```

### Database Connection Issues

- Verify MongoDB URL in `.env`
- Check network connectivity
- Ensure IP whitelist in MongoDB Atlas includes your server IP

### Email Not Sending

- Enable "Less secure app access" for Gmail (or use App Password)
- Verify SMTP credentials
- Check firewall settings for port 587

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong SECRET_KEY** - Generate with: `openssl rand -hex 32`
3. **Enable HTTPS** with SSL certificates
4. **Restrict CORS origins** to your domain only
5. **Use MongoDB Atlas** IP whitelist
6. **Regular backups** of database
7. **Update dependencies** regularly
8. **Monitor logs** for suspicious activity
9. **Use strong passwords** for all services
10. **Enable Redis password** in production

---

## 🎯 Environment-Specific Commands

### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production
```bash
docker-compose up -d --build
```

### Staging
```bash
ENVIRONMENT=staging docker-compose up -d
```

---

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review documentation
- Check GitHub issues

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas configured and accessible
- [ ] Environment variables set correctly
- [ ] Cloudinary account set up
- [ ] Razorpay account configured (production keys)
- [ ] SMTP credentials working
- [ ] Domain DNS configured
- [ ] SSL certificate obtained
- [ ] Docker installed on server
- [ ] Application deployed and running
- [ ] HTTPS working correctly
- [ ] Email functionality tested
- [ ] Payment gateway tested
- [ ] Backup strategy in place
- [ ] Monitoring set up

---

**🎉 Your e-commerce application is now deployment-ready!**
