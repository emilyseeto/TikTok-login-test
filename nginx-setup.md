# Nginx Configuration for TikTok Login Test

This document provides Nginx configuration options for your TikTok login application.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
- **No Nginx configuration needed**
- Vercel handles all routing and SSL automatically
- Use the existing `vercel.json` configuration
- Set environment variables in Vercel dashboard

### Option 2: Self-hosted with Nginx
Use the provided Nginx configurations for self-hosting:

#### For Production (nginx.conf)
```bash
# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/tiktok-login
sudo ln -s /etc/nginx/sites-available/tiktok-login /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### For Docker (nginx-docker.conf)
```bash
# Start with Docker Compose
docker-compose up -d
```

## 🔧 Nginx Configuration Features

### Security Headers
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)
- `Referrer-Policy: strict-origin-when-cross-origin`

### Performance Optimizations
- Gzip compression for text assets
- Static asset caching (1 year)
- HTTP/2 support
- Connection keep-alive

### CORS Configuration
- Proper CORS headers for TikTok OAuth
- Preflight request handling
- Cross-origin support

### SSL/TLS Configuration
- TLS 1.2 and 1.3 support
- Strong cipher suites
- HSTS headers

## 📁 File Structure

```
tiktok-login-test/
├── nginx.conf              # Production Nginx config
├── nginx-docker.conf       # Docker Nginx config
├── docker-compose.yml      # Docker Compose setup
├── Dockerfile             # Node.js container
├── server.js              # Express server
└── nginx-setup.md         # This file
```

## 🐳 Docker Deployment

### Quick Start
```bash
# Set environment variables
export TIKTOK_CLIENT_KEY="sbawscptfcgjaj8kxa"
export TIKTOK_CLIENT_SECRET="Vowrg3Nafz8Tcb84Z46xfv5PlfG8YFAW"
export TIKTOK_REDIRECT_URI="https://your-domain.com/api/callback"

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Services
- **nginx**: Web server (ports 80, 443)
- **nodejs**: API server (internal port 3000)

## 🔒 SSL Certificate Setup

### For Production (nginx.conf)
1. Obtain SSL certificates (Let's Encrypt recommended)
2. Update certificate paths in `nginx.conf`:
   ```nginx
   ssl_certificate /path/to/your/certificate.crt;
   ssl_certificate_key /path/to/your/private.key;
   ```

### For Docker
Use a reverse proxy like Traefik or Nginx Proxy Manager for automatic SSL.

## 🌐 Environment Variables

### Required Variables
```bash
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_REDIRECT_URI=https://your-domain.com/api/callback
```

### Optional Variables
```bash
NODE_ENV=production
PORT=3000
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoints
- `GET /health` - Application health
- `GET /api/oauth` - OAuth endpoint test

### Log Files
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`
- Application logs: Docker container logs

## 🚨 Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if Node.js server is running
   - Verify proxy_pass URL in Nginx config

2. **SSL Certificate Errors**
   - Verify certificate paths
   - Check certificate validity
   - Ensure proper file permissions

3. **CORS Issues**
   - Verify CORS headers in Nginx config
   - Check TikTok redirect URI configuration

4. **State Parameter Mismatch**
   - Ensure cookies are working properly
   - Check HTTPS requirement for secure cookies

### Debug Commands
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test API endpoints
curl -I https://your-domain.com/api/oauth
curl -I https://your-domain.com/health
```

## 📊 Performance Tuning

### Nginx Optimizations
- Worker processes: `worker_processes auto;`
- Worker connections: `worker_connections 1024;`
- Keep-alive timeout: `keepalive_timeout 65;`
- Gzip compression enabled

### Application Optimizations
- Static file serving via Nginx
- API proxying to Node.js
- Proper caching headers
- Connection pooling

This configuration provides a production-ready setup for your TikTok login application with proper security, performance, and monitoring capabilities.
