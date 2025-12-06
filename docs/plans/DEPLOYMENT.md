# CoParent - Deployment Guide

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Domain configured (optional)

## Initial Setup

### 1. Firebase Login

```bash
firebase login
```

### 2. Initialize Firebase Project

```bash
firebase use --add
# Select your project: coparent-5597c
# Enter alias: default
```

### 3. Configure Environment Variables

Ensure `.env` file has all required variables:

```env
VITE_FIREBASE_API_KEY=***
VITE_FIREBASE_AUTH_DOMAIN=coparent-5597c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=coparent-5597c
VITE_FIREBASE_STORAGE_BUCKET=***
VITE_FIREBASE_MESSAGING_SENDER_ID=***
VITE_FIREBASE_APP_ID=***
VITE_GEMINI_API_KEY=*** (optional)
```

## Deployment Steps

### Step 1: Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Step 2: Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

**What this does:**
- Deploys security rules to Firestore
- Creates necessary composite indexes for queries
- Enables proper data access control

### Step 3: Deploy Storage Rules

```bash
firebase deploy --only storage
```

**What this does:**
- Deploys security rules for Firebase Storage
- Protects uploaded documents and receipts
- Configures access permissions

### Step 4: Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

**Functions deployed:**
- `parseAgreement` - Triggered on document upload
- `notifyExpenseAdded` - Triggered when expense created
- `notifySplitRatioChanged` - Triggered on split ratio update
- `notifySwapRequest` - Triggered on swap request
- `updateCPILinkedPayments` - Scheduled monthly function

### Step 5: Deploy Hosting

```bash
firebase deploy --only hosting
```

**What this does:**
- Uploads the `dist/` directory to Firebase Hosting
- Configures routing (SPA rewrites to index.html)
- Enables HTTPS automatically
- Provides global CDN distribution

### Step 6: Deploy Everything (Full Deployment)

```bash
npm run build && firebase deploy
```

This deploys all Firebase services at once:
- Firestore rules and indexes
- Storage rules
- Cloud Functions
- Hosting

## Post-Deployment

### 1. Verify Deployment

Check the hosting URL:
```
https://coparent-5597c.web.app
# or
https://coparent-5597c.firebaseapp.com
```

### 2. Configure Custom Domain (Optional)

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow DNS configuration steps
4. Wait for SSL certificate provisioning (can take up to 24 hours)

### 3. Enable Firebase Features

**Authentication:**
- Go to Firebase Console > Authentication
- Enable Email/Password provider
- Enable Google OAuth provider
- Add authorized domains

**Firestore:**
- Database created in production mode
- Rules deployed via firebase.json
- Indexes deployed via firestore.indexes.json

**Storage:**
- Create default bucket if not exists
- Rules deployed via storage.rules

### 4. Configure Cloud Functions Environment

Set environment variables for Cloud Functions:

```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
firebase functions:config:set email.from="noreply@coparent.com"
```

View current config:
```bash
firebase functions:config:get
```

### 5. Monitor Functions

View function logs:
```bash
firebase functions:log
```

Real-time logs:
```bash
firebase functions:log --follow
```

## Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

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
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: coparent-5597c
```

### Manual Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Build the app
echo "📦 Building application..."
npm run build

# Deploy everything
echo "🔥 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌐 Visit: https://coparent-5597c.web.app"
```

Make executable:
```bash
chmod +x deploy.sh
```

Run:
```bash
./deploy.sh
```

## Rollback

### Rollback Hosting

View deployment history:
```bash
firebase hosting:channel:list
```

Rollback to previous version:
```bash
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

### Rollback Functions

Cloud Functions maintain previous versions. Rollback via Firebase Console:
1. Go to Functions
2. Select function
3. Click "Revisions"
4. Route traffic to previous version

## Monitoring & Analytics

### Firebase Console

- **Performance**: Monitor page load times
- **Crashlytics**: Track errors (if enabled)
- **Analytics**: User engagement (if enabled)

### Function Monitoring

```bash
# View function execution count
firebase functions:log --only parseAgreement

# Check for errors
firebase functions:log --only notifyExpenseAdded | grep ERROR
```

## Cost Optimization

### Hosting
- Free tier: 10 GB bandwidth/month
- CDN included
- SSL certificate included

### Firestore
- Free tier: 50k reads, 20k writes, 20k deletes per day
- Monitor usage in Firebase Console

### Functions
- Free tier: 2M invocations/month
- Consider batching operations
- Use scheduled functions sparingly

### Storage
- Free tier: 5 GB storage, 1 GB/day transfer
- Compress images before upload
- Set lifecycle rules for old files

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Function Deployment Fails

```bash
# Rebuild functions
cd functions
rm -rf node_modules lib
npm install
npm run build
cd ..
firebase deploy --only functions
```

### Rules Deployment Fails

```bash
# Validate rules locally
firebase emulators:start --only firestore

# Force deploy
firebase deploy --only firestore:rules --force
```

### SSL Certificate Issues

- Wait 24 hours for propagation
- Verify DNS records are correct
- Check Firebase Console > Hosting > Custom domains

## Environment-Specific Deployments

### Staging Environment

```bash
# Create staging project
firebase projects:list
firebase use staging

# Deploy to staging
npm run build && firebase deploy
```

### Production Environment

```bash
# Switch to production
firebase use production

# Deploy with confirmation
npm run build && firebase deploy --only hosting,functions
```

## Backup Strategy

### Firestore Backup

Set up automated exports:

```bash
# Via Cloud Console
gcloud firestore export gs://your-bucket/backups
```

### Storage Backup

Use Cloud Storage versioning:
- Enable object versioning in Cloud Console
- Set retention policy
- Configure lifecycle rules

## Security Checklist

- [ ] Environment variables set correctly
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Firebase Auth providers configured
- [ ] Custom domain SSL enabled
- [ ] Function environment variables set
- [ ] CORS configured for API calls
- [ ] Rate limiting enabled (if using Cloud Functions 2nd gen)

## Support

For deployment issues:
- Check Firebase Status: https://status.firebase.google.com
- Firebase Console: https://console.firebase.google.com/project/coparent-5597c
- Firebase Support: https://firebase.google.com/support

---

**Production URL**: https://coparent-5597c.web.app
**Firebase Console**: https://console.firebase.google.com/project/coparent-5597c
