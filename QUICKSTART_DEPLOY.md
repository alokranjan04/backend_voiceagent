# Quick Start: Deploy to Google Cloud Run

## Current Status
✅ All deployment files created
⚠️ gcloud CLI not installed

## Next Steps

### Step 1: Install gcloud CLI

**Download and install:**
https://cloud.google.com/sdk/docs/install#windows

**After installation, restart your terminal and run:**
```powershell
gcloud --version
gcloud init
```

### Step 2: Deploy

Once gcloud is installed, run:

```powershell
# Set your Google Cloud project ID
$env:GCLOUD_PROJECT_ID = "your-project-id-here"

# Run deployment
.\deploy.ps1
```

---

## Alternative: Deploy Without CLI

If you prefer not to install gcloud CLI, you can deploy via the Google Cloud Console:

1. Go to https://console.cloud.google.com/run
2. Click "CREATE SERVICE"
3. Select "Deploy one revision from an existing container image" → "Set up with Cloud Build"
4. Upload your code or connect GitHub repository
5. Configure:
   - Region: us-central1
   - Allow unauthenticated invocations: Yes
   - Container port: 8080
   - CPU: 1
   - Memory: 512 MiB
6. Add environment variables:
   - CLIENT_ID
   - CLIENT_SECRET
   - REDIRECT_URI (you'll get this after deployment)
   - PORT=8080
7. Click "CREATE"

---

## What Happens Next

After deployment:

1. **You'll get a URL** like: `https://calendar-gmail-webhook-xyz.run.app`

2. **Update OAuth settings**:
   - Go to Google Cloud Console → APIs & Credentials
   - Add redirect URI: `https://your-url.run.app/auth/callback`

3. **Authenticate**:
   - Visit: `https://your-url.run.app/auth`

4. **Use in VAPI**:
   - Webhook URL: `https://your-url.run.app/vapi-webhook`

---

## Files Created

✅ `Dockerfile` - Container configuration
✅ `.dockerignore` - Files to exclude from container
✅ `deploy.ps1` - PowerShell deployment script
✅ `deploy.sh` - Bash deployment script
✅ `.env.production.example` - Production environment template
✅ `DEPLOYMENT.md` - Complete deployment guide

---

## Need Help?

See the full deployment guide: [DEPLOYMENT.md](file:///c:/Users/Alok%20Ranjan/Documents/Backend%20VoiceAgent/DEPLOYMENT.md)
