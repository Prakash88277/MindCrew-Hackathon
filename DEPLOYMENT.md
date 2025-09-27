# Deployment Guide

This guide covers deploying the Symptom Logger application to various platforms.

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Firebase project
- Git repository

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/symptom-logger
JWT_SECRET=your-super-secret-jwt-key-here
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
CORS_ORIGIN=https://your-frontend-url.com
```

## Frontend Deployment (Vercel)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from frontend directory
   cd frontend
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all frontend environment variables

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Backend Deployment (Render)

1. **Create New Web Service**
   - Connect your GitHub repository
   - Select the `backend` directory as root
   - Choose Node.js as environment

2. **Configure Build Settings**
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables**
   - Add all backend environment variables in Render dashboard

4. **Database Setup**
   - Use MongoDB Atlas for production
   - Update MONGODB_URI with your Atlas connection string

## Backend Deployment (Railway)

1. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Deploy from backend directory
   cd backend
   railway init
   railway up
   ```

2. **Add Database**
   - Add MongoDB service in Railway dashboard
   - Update MONGODB_URI with Railway's MongoDB URL

3. **Environment Variables**
   - Add all backend environment variables in Railway dashboard

## Docker Deployment

### Local Development
```bash
# Start with Docker Compose
cd backend
docker-compose up -d

# Seed the database
docker-compose exec backend npm run seed
```

### Production
```bash
# Build and run
docker build -t symptom-logger-backend .
docker run -p 5000:5000 --env-file .env symptom-logger-backend
```

## Database Setup

### MongoDB Atlas
1. Create a new cluster
2. Create a database user
3. Whitelist your IP addresses
4. Get connection string
5. Update MONGODB_URI

### Seed Data
```bash
# After deployment, seed the database
cd backend
npm run seed
```

## Firebase Setup

1. **Create Firebase Project**
   - Go to Firebase Console
   - Create new project
   - Enable Authentication

2. **Configure Authentication**
   - Enable Email/Password provider
   - Enable Anonymous authentication

3. **Get Configuration**
   - Go to Project Settings → General
   - Copy web app configuration

4. **Service Account**
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Use for backend authentication

## Health Checks

### Backend Health Check
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2023-...",
  "environment": "production"
}
```

### Frontend Health Check
Visit your frontend URL and check if the app loads without errors.

## Monitoring

### Backend Monitoring
- Use your hosting platform's monitoring tools
- Set up alerts for high error rates
- Monitor database performance

### Frontend Monitoring
- Use Vercel Analytics (if using Vercel)
- Set up error tracking (Sentry, LogRocket, etc.)

## Security Checklist

- [ ] HTTPS enabled for all endpoints
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive data

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGIN environment variable
   - Ensure frontend URL is whitelisted

2. **Database Connection Issues**
   - Verify MONGODB_URI format
   - Check network connectivity
   - Verify database credentials

3. **Firebase Authentication Issues**
   - Check Firebase configuration
   - Verify service account credentials
   - Check Firebase project settings

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Logs

```bash
# View backend logs (Docker)
docker-compose logs -f backend

# View backend logs (Render)
# Check Render dashboard → Logs

# View backend logs (Railway)
railway logs
```

## Scaling

### Horizontal Scaling
- Use load balancer for multiple backend instances
- Implement session storage (Redis) if needed
- Use CDN for frontend assets

### Database Scaling
- Use MongoDB Atlas auto-scaling
- Implement database indexing
- Consider read replicas for heavy read workloads

## Backup Strategy

1. **Database Backups**
   - Enable MongoDB Atlas automated backups
   - Test restore procedures regularly

2. **Code Backups**
   - Use Git for version control
   - Tag releases for easy rollback

3. **Configuration Backups**
   - Document all environment variables
   - Keep configuration files in version control

## Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement lazy loading
   - Optimize bundle size

2. **Backend**
   - Implement caching (Redis)
   - Use database indexes
   - Optimize database queries
   - Implement rate limiting

3. **Database**
   - Create appropriate indexes
   - Monitor query performance
   - Use connection pooling
