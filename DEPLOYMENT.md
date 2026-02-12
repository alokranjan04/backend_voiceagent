# Google Cloud Run Deployment Guide

This guide will help you deploy the webhook server to Google Cloud Run for VAPI integration.

## ⚠️ gcloud CLI Not Detected

The gcloud CLI is not currently installed on your system. You have two options:

### Option A: Install gcloud CLI (Recommended)

1. **Download Google Cloud SDK**:
   - Windows: https://cloud.google.com/sdk/docs/install#windows
   - Download the installer and run it
   - Follow the installation wizard

2. **Verify Installation**:
   ```powershell
   gcloud --version
   ```

3. **Initialize gcloud**:
   ```powershell
   gcloud init
   ```

### Option B: Deploy via Google Cloud Console (No CLI Required)

See the "Deploy via Google Cloud Console" section below for GUI-based deployment.

---

## Prerequisites

- ✅ Google Cloud account (same account as your OAuth credentials)
- ⚠️ gcloud CLI (install using instructions above)
- ✅ Local server tested and working

## Quick Deploy (Automated)

### For Windows (PowerShell):

```powershell
# Set your project ID
$env:GCLOUD_PROJECT_ID = "your-project-id"

# Run deployment script
.\deploy.ps1
```

### For Mac/Linux (Bash):

```bash
# Set your project ID
export GCLOUD_PROJECT_ID="your-project-id"

# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

---

## Manual Deployment Steps

### Step 1: Install gcloud CLI

Download and install from: https://cloud.google.com/sdk/docs/install

Verify installation:
```bash
gcloud --version
```

### Step 2: Login and Setup

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy calendar-gmail-webhook \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --timeout 60
```

This command will:
- Build a Docker image from your code
- Push it to Google Container Registry
- Deploy to Cloud Run
- Return a public HTTPS URL

### Step 4: Get Your Service URL

```bash
gcloud run services describe calendar-gmail-webhook \
  --region us-central1 \
  --format 'value(status.url)'
```

Example output: `https://calendar-gmail-webhook-abc123-uc.a.run.app`

### Step 5: Configure Environment Variables

```bash
gcloud run services update calendar-gmail-webhook \
  --region us-central1 \
  --set-env-vars CLIENT_ID=your_client_id_here,CLIENT_SECRET=your_client_secret_here,REDIRECT_URI=https://your-service-url.run.app/auth/callback,PORT=8080
```

**Replace:**
- `your_client_id_here` - Your Google OAuth Client ID
- `your_client_secret_here` - Your Google OAuth Client Secret
- `your-service-url.run.app` - Your actual Cloud Run URL from Step 4

### Step 6: Update OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", click "+ ADD URI"
4. Add: `https://your-service-url.run.app/auth/callback`
5. Click "SAVE"
6. Wait 2-3 minutes for changes to propagate

### Step 7: Authenticate

Visit your auth URL in a browser:
```
https://your-service-url.run.app/auth
```

Complete the OAuth flow to authenticate.

### Step 8: Test the Webhook

```bash
curl -X POST https://your-service-url.run.app/vapi-webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","time":"2026-02-20T10:00:00+05:30"}'
```

You should receive a success response and see:
- Calendar event created in Google Calendar
- Confirmation email sent

---

## VAPI Integration

### Configure VAPI Webhook

1. **Go to VAPI Dashboard**
2. **Navigate to your assistant settings**
3. **Add Server URL Function**:
   - URL: `https://your-service-url.run.app/vapi-webhook`
   - Method: POST
   - Headers: `Content-Type: application/json`

4. **Configure Function Parameters**:
   ```json
   {
     "name": "{{name}}",
     "email": "{{email}}",
     "time": "{{time}}"
   }
   ```

5. **Test** by making a voice call through VAPI

---

## Monitoring and Logs

### View Logs

```bash
gcloud run services logs read calendar-gmail-webhook \
  --region us-central1 \
  --limit 50
```

### View in Console

Visit: https://console.cloud.google.com/run

---

## Troubleshooting

### "Not authenticated" Error

**Problem:** OAuth tokens not set or expired

**Solution:**
1. Visit `https://your-service-url.run.app/auth`
2. Complete OAuth flow
3. Note: Cloud Run is stateless, tokens are stored in memory
4. For production, implement persistent token storage (database)

### "redirect_uri_mismatch" Error

**Problem:** Redirect URI not configured in Google Cloud Console

**Solution:**
1. Verify the redirect URI in Google Cloud Console matches exactly
2. Wait 2-3 minutes after adding it
3. Clear browser cache and try again

### Deployment Fails

**Problem:** gcloud CLI not authenticated or project not set

**Solution:**
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Environment Variables Not Set

**Problem:** Service deployed but env vars missing

**Solution:**
```bash
# Update environment variables
gcloud run services update calendar-gmail-webhook \
  --region us-central1 \
  --set-env-vars CLIENT_ID=xxx,CLIENT_SECRET=xxx,REDIRECT_URI=xxx
```

---

## Cost Optimization

**Cloud Run Pricing:**
- Free tier: 2 million requests/month
- 180,000 vCPU-seconds/month
- 360,000 GiB-seconds/month

**For VAPI webhook usage:**
- Estimated cost: **$0-5/month** (depending on call volume)
- Most users stay within free tier

**Tips:**
- Set `--max-instances 10` to limit scaling
- Use `--memory 512Mi` (sufficient for this app)
- Set `--timeout 60` to prevent long-running requests

---

## Security Best Practices

### 1. Use Secrets for Sensitive Data

Instead of environment variables, use Cloud Run secrets:

```bash
# Create secrets
echo -n "your_client_id" | gcloud secrets create CLIENT_ID --data-file=-
echo -n "your_client_secret" | gcloud secrets create CLIENT_SECRET --data-file=-

# Deploy with secrets
gcloud run deploy calendar-gmail-webhook \
  --source . \
  --region us-central1 \
  --set-secrets CLIENT_ID=CLIENT_ID:latest,CLIENT_SECRET=CLIENT_SECRET:latest
```

### 2. Add Webhook Authentication

Consider adding API key verification to the webhook endpoint:

```javascript
// In server.js
app.post("/vapi-webhook", (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.WEBHOOK_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // ... rest of webhook code
});
```

### 3. Implement Token Persistence

For production, store OAuth tokens in a database instead of memory:
- Cloud Firestore
- Cloud SQL
- MongoDB Atlas

---

## Updating the Deployment

When you make code changes:

```bash
# Redeploy (Cloud Build will rebuild automatically)
gcloud run deploy calendar-gmail-webhook \
  --source . \
  --region us-central1
```

---

## Alternative: Deploy via Google Cloud Console

If you prefer a GUI:

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click "CREATE SERVICE"
3. Select "Continuously deploy from a repository" or "Deploy one revision from source"
4. Follow the wizard to configure:
   - Source: Upload your code or connect GitHub
   - Region: us-central1
   - Authentication: Allow unauthenticated
   - Container port: 8080
   - Environment variables: Add CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
5. Click "CREATE"

---

## Next Steps After Deployment

1. ✅ Authenticate at your `/auth` endpoint
2. ✅ Test webhook with curl
3. ✅ Configure VAPI with webhook URL
4. ✅ Test end-to-end with a voice call
5. ✅ Monitor logs for any issues
6. ✅ Consider implementing persistent token storage for production

---

## Support

For issues:
- Check Cloud Run logs: `gcloud run services logs read calendar-gmail-webhook`
- Review [Cloud Run documentation](https://cloud.google.com/run/docs)
- Check [OAuth troubleshooting guide](file:///c:/Users/Alok%20Ranjan/Documents/Backend%20VoiceAgent/OAUTH_TROUBLESHOOTING.md)
