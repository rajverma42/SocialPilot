# Production Deployment & Infrastructure Guide

## 1. Cloud Infrastructure Prerequisites

- **Google Cloud Project**: Project with billing enabled.
- **Enabled APIs**:
  ```bash
  gcloud services enable \
    run.googleapis.com \
    firestore.googleapis.com \
    cloudtasks.googleapis.com \
    cloudscheduler.googleapis.com \
    secretmanager.googleapis.com \
    storage.googleapis.com
  ```

---

## 2. Deploy Cloud Firestore & Security Rules

1. **Deploy Firestore Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Firestore Indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

---

## 3. Google Secret Manager Setup

Store encryption master keys and OAuth provider secrets in Secret Manager:
```bash
# 1. Master Envelope Encryption Key (AES-256)
openssl rand -hex 32 | gcloud secrets create APP_ENCRYPTION_KEY --data-file=-

# 2. Meta Facebook App Secret
echo -n "your_meta_app_secret" | gcloud secrets create FACEBOOK_APP_SECRET --data-file=-

# 3. Telegram Bot Token
echo -n "your_telegram_bot_token" | gcloud secrets create TELEGRAM_BOT_TOKEN --data-file=-
```

---

## 4. Deploying to Cloud Run

Build and deploy the application container to Cloud Run:

```bash
# Build production assets
npm run build

# Deploy Cloud Run service
gcloud run deploy socialpilot-backend \
  --image gcr.io/$PROJECT_ID/socialpilot:latest \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=3000 \
  --set-secrets APP_ENCRYPTION_KEY=APP_ENCRYPTION_KEY:latest \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10
```

---

## 5. Cloud Scheduler & Cloud Tasks Setup

Configure Cloud Scheduler to ping the publishing worker daemon every minute:

```bash
gcloud scheduler jobs create http publishing-daemon-trigger \
  --schedule="* * * * *" \
  --uri="https://socialpilot-backend-xxx.run.app/api/v1/scheduled-jobs/daemon-tick" \
  --http-method=POST \
  --oidc-service-account-email="publishing-worker@$PROJECT_ID.iam.gserviceaccount.com"
```
