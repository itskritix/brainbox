# 🚀 Deployment Guide

This guide helps you deploy BrainBox with your custom domain easily.

## 📋 Quick Deployment Checklist

- [ ] Choose your domain strategy
- [ ] Configure environment variables  
- [ ] Deploy backend server
- [ ] Deploy frontend app
- [ ] Test the connection

## 🌐 Domain Strategy Options

### Option 1: API Subdomain (Recommended)
```
Frontend:  https://app.yourdomain.com
Backend:   https://api.yourdomain.com
```

**Pros:** Clean separation, easy SSL, no CORS issues
**Setup:** Point subdomains to respective servers

### Option 2: Same Domain + Reverse Proxy
```
Frontend:  https://yourdomain.com
Backend:   https://yourdomain.com/api
```

**Pros:** Single domain, unified access
**Setup:** Configure nginx/apache to proxy `/api` to backend

### Option 3: Different Ports
```
Frontend:  https://yourdomain.com:4000  
Backend:   https://yourdomain.com:3000
```

**Pros:** Simple setup for development/staging
**Setup:** Open firewall ports, configure DNS

## ⚙️ Configuration Steps

### 1. Frontend Configuration

Create `.env.local` in your frontend deployment:

```bash
# For API subdomain
VITE_SERVER_DOMAIN=api.yourdomain.com

# For same domain + reverse proxy  
VITE_SERVER_DOMAIN=yourdomain.com

# For different ports
VITE_SERVER_DOMAIN=yourdomain.com:3000
```

### 2. Backend Configuration

Configure your backend server environment:

```bash
# Server configuration
SERVER_NAME="Your Company BrainBox"
SERVER_CORS_ORIGIN=https://app.yourdomain.com

# Database
POSTGRES_URL=postgresql://user:pass@localhost:5432/brainbox
REDIS_URL=redis://localhost:6379

# Storage  
STORAGE_S3_ENDPOINT=https://s3.yourdomain.com
# ... other S3 config
```

### 3. Auto-Detection (No Config Needed)

If you don't set `VITE_SERVER_DOMAIN`, the app will auto-detect:

- `app.yourdomain.com` → `api.yourdomain.com`
- `yourdomain.com` → `yourdomain.com:3000`

## 🐳 Docker Deployment

### Using Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: ./apps/web
    ports:
      - "80:80"
    environment:
      - VITE_SERVER_DOMAIN=api.yourdomain.com
      
  backend:
    build: ./apps/server  
    ports:
      - "3000:3000"
    environment:
      - SERVER_CORS_ORIGIN=https://yourdomain.com
      - POSTGRES_URL=postgresql://user:pass@db:5432/brainbox
```

## ☁️ Cloud Platform Examples

### Vercel + Railway
```bash
# Frontend (Vercel)
VITE_SERVER_DOMAIN=yourapp.railway.app

# Backend (Railway)
SERVER_CORS_ORIGIN=https://yourapp.vercel.app
```

### Netlify + Heroku  
```bash
# Frontend (Netlify)
VITE_SERVER_DOMAIN=yourapp.herokuapp.com

# Backend (Heroku)
SERVER_CORS_ORIGIN=https://yourapp.netlify.app
```

### AWS/DigitalOcean
```bash
# Frontend
VITE_SERVER_DOMAIN=api.yourdomain.com

# Backend  
SERVER_CORS_ORIGIN=https://app.yourdomain.com
```

## 🔧 Advanced Configuration

### Custom Runtime Configuration

You can also configure the server domain at runtime by setting a global variable:

```html
<!-- In your index.html -->
<script>
  window.BRAINBOX_SERVER_DOMAIN = 'api.yourdomain.com';
</script>
```

### Environment-Specific Builds

```bash
# Build for staging
VITE_SERVER_DOMAIN=api-staging.yourdomain.com npm run build

# Build for production
VITE_SERVER_DOMAIN=api.yourdomain.com npm run build
```

## 🔍 Testing Your Deployment

1. **Check server connection:**
   ```bash
   curl https://api.yourdomain.com/config
   ```

2. **Test CORS:**
   Open browser console on your frontend and check for CORS errors

3. **Verify WebSocket:**
   Check browser network tab for successful WebSocket connections

## 🚨 Troubleshooting

### CORS Issues
- Ensure `SERVER_CORS_ORIGIN` matches your frontend URL exactly
- Check protocol (http vs https)
- Verify subdomain configuration

### Connection Refused
- Check if backend server is running and accessible
- Verify firewall/security group settings  
- Test with curl/postman first

### Environment Variables Not Working
- Ensure variables start with `VITE_` for frontend
- Restart your dev server after changing `.env.local`
- Check if variables are available in `import.meta.env`

## 🧪 Test Deployment - brainbox.anavilabs.com

For quick test deployment at brainbox.anavilabs.com:

### 1. Use Test Configuration
```bash
cp .env.anavilabs .env
```

### 2. Frontend Apps
```bash
# Web app
cd apps/web
echo "VITE_SERVER_DOMAIN=brainbox.anavilabs.com" > .env.local

# Desktop app  
cd apps/desktop
echo "VITE_SERVER_DOMAIN=brainbox.anavilabs.com" > .env.local
```

### 3. Local Services
```bash
# Database
createdb brainbox_test

# MinIO (storage)
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

### 4. Build & Deploy
```bash
npm run build
npm run start:server
```

### 5. Web Server Setup
Configure nginx/apache:
```nginx
# Proxy API requests
location /api/ {
    proxy_pass http://localhost:3000/;
}

# Serve frontend
location / {
    root /path/to/brainbox/apps/web/dist;
}
```

**Note:** This test setup uses local database/storage. Replace with production services for real deployment.

## 📞 Support

If you need help with deployment, please:
1. Check this guide first
2. Review the troubleshooting section
3. Open an issue with your configuration details

---

**Happy Deploying! 🎉**