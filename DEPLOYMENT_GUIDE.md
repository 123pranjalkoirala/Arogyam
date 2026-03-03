# 🏥 Arogyam Healthcare System - Deployment Guide

## 🚀 Production Deployment Instructions

### 📋 Prerequisites
- Node.js 18+
- MongoDB Atlas account
- eSewa Merchant Account (Test/Production)
- Domain name (for production)
- SSL certificate (required for production payments)

### 🔧 Environment Setup

1. **Copy Environment File:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Fill in Actual Values:**
   ```bash
   # Required for production
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/your_db
   JWT_SECRET=your_production_jwt_secret_32_chars_min
   CLIENT_URL=https://yourdomain.com
   ESEWA_SECRET_KEY=your_production_esewa_secret
   ESEWA_MERCHANT_CODE=YOUR_MERCHANT_CODE
   ESEWA_PRODUCT_CODE=YOUR_PRODUCT_CODE
   
   # Production URLs
   ESEWA_BASE_URL=https://esewa.com.np/api/epay/main/v2/form
   ESEWA_SUCCESS_URL=https://yourdomain.com/api/payments/esewa/callback
   ESEWA_FAILURE_URL=https://yourdomain.com/api/payments/esewa/failure
   ```

### 🌐 Production Deployment Options

#### Option 1: Render (Recommended)
```yaml
# render.yaml
services:
  type: web
  name: arogyam-backend
  env: node
  plan: free
  buildCommand: npm install
  startCommand: node server.js
  envVars:
    - key: NODE_ENV
      value: production
    - key: MONGODB_URI
      sync: false
    - key: JWT_SECRET
      sync: false
    - key: CLIENT_URL
      value: https://yourapp.onrender.com
    - key: ESEWA_SECRET_KEY
      sync: false
```

#### Option 2: Railway
```bash
# Deploy to Railway
railway login
railway new
git add .
git commit -m "Deploy Arogyam"
git push railway main
```

#### Option 3: Vercel + DigitalOcean
```bash
# Frontend to Vercel
vercel --prod

# Backend to DigitalOcean
# Deploy with Dockerfile
docker build -t arogyam-backend .
docker run -p 5000:5000 arogyam-backend
```

### 🔒 Security Checklist

#### ✅ Before Production:
- [ ] Change all default passwords
- [ ] Use production MongoDB (not localhost)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS everywhere
- [ ] Use production eSewa credentials
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging

#### ✅ eSewa Production Setup:
- [ ] Contact eSewa for production merchant code
- [ ] Update ESEWA_BASE_URL to production
- [ ] Configure production callbacks
- [ ] Test with small amounts first
- [ ] Set up webhook monitoring

### 🐛 Common Issues & Solutions

#### Payment Issues:
```javascript
// Check signature verification
console.log("Expected signature:", expectedSignature);
console.log("Received signature:", receivedSignature);

// Common fixes:
1. Ensure ESEWA_SECRET_KEY matches exactly
2. Check product code matches
3. Verify amount format (no decimals)
4. Check callback URL accessibility
```

#### Database Issues:
```javascript
// MongoDB connection troubleshooting
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Common fixes:
1. Check IP whitelist in MongoDB Atlas
2. Verify connection string format
3. Ensure network access
```

#### CORS Issues:
```javascript
// Proper CORS setup
app.use(cors({ 
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

### 📊 Monitoring Setup

#### Recommended Tools:
- **Application Monitoring:** Sentry.io
- **Performance:** New Relic
- **Uptime:** Uptime Robot
- **Logs:** Logtail / Papertrail

#### Health Check Endpoint:
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### 🔄 Backup Strategy

#### Database Backups:
```bash
# MongoDB Atlas automated backups
# Settings → Cluster → Backup
# Enable daily backups
# Retain 30 days
```

#### Code Backups:
```bash
# Git strategy
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin --tags
```

### 🚨 Error Handling Checklist

#### Payment Errors:
- [ ] Invalid signature → Check secret key
- [ ] Amount mismatch → Verify decimal places
- [ ] Timeout → Check eSewa status
- [ ] Duplicate → Check transaction UUID

#### System Errors:
- [ ] Database connection → Connection string
- [ ] JWT expired → Refresh token logic
- [ ] Rate limits → Implement backoff
- [ ] Memory leaks → Monitor heap usage

### 📱 Testing in Production

#### Payment Testing:
```bash
# Test with small amounts
1. Rs. 10 payment
2. Verify callback received
3. Check appointment status update
4. Test refund process
```

#### Load Testing:
```bash
# Use Artillery or k6
artillery run load-test.yml
# Monitor response times
# Check database performance
```

### 🎯 Production Go-Live Checklist

#### Final Checks:
- [ ] All environment variables set
- [ ] Database accessible from production
- [ ] SSL certificates installed
- [ ] eSewa production credentials tested
- [ ] Payment callbacks working
- [ ] Email notifications sending
- [ ] Frontend build optimized
- [ ] Error monitoring active
- [ ] Backup schedule configured
- [ ] Domain DNS configured
- [ ] Load balancer set up (if needed)

### 📞 Support Information

#### For Production Issues:
1. **Check Logs:** `tail -f /var/log/app.log`
2. **Database:** MongoDB Atlas logs
3. **Payment:** eSewa merchant dashboard
4. **Monitoring:** Your monitoring dashboard

#### Emergency Contacts:
- Technical Lead: [Your contact]
- eSewa Support: [eSewa contact]
- Database Support: MongoDB support

---

## 🎉 Deployment Complete!

Once deployed successfully:
1. Test full appointment flow
2. Verify payment processing
3. Check email notifications
4. Monitor for 24 hours
5. Set up alerts for errors

**Your Arogyam Healthcare System is now production-ready!** 🏥⚕
