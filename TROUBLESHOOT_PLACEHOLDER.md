# Troubleshooting Placeholder Page

## Why You're Seeing the Placeholder

The placeholder page appears because Cloud Run is set up for continuous deployment from GitHub, but the actual service isn't running yet.

## Quick Fix Steps

### Option 1: Check Build Status (Recommended)

1. **Click "BACK TO CLOUD RUN"** button on the placeholder page
2. **Look at "Build History"** (red icon if failed)
3. **Click on the latest build** to see logs
4. **Common errors:**
   - Missing `package-lock.json`
   - Dockerfile errors
   - npm install failures

### Option 2: Check if Service is Running

1. Go to: https://console.cloud.google.com/run
2. Find service: `backend-voiceagent-git`
3. Check if it shows "✓" (green checkmark) or "!" (error)
4. Click on the service name
5. Look at "Revisions" tab - is there a serving revision?

### Option 3: View Logs

1. In Cloud Run service page
2. Click "LOGS" tab
3. Look for errors like:
   - "Error: Cannot find module"
   - "npm ERR!"
   - "Container failed to start"

## Most Likely Issue: Missing package-lock.json

If the build is failing, it's probably because `package-lock.json` wasn't committed to GitHub.

**Fix:**

```bash
# In your local project
npm install
git add package-lock.json
git commit -m "Add package-lock.json for Cloud Build"
git push
```

This will trigger a new build automatically.

## Alternative: Deploy Without Continuous Deployment

If continuous deployment keeps failing, you can deploy directly:

1. **Stop the current deployment**:
   - Go to Cloud Run service
   - Click "Delete Service"

2. **Deploy fresh**:
   - Go to: https://console.cloud.google.com/run
   - Click "CREATE SERVICE"
   - Choose "Deploy one revision from source"
   - Upload the ZIP file: `calendar-gmail-webhook-deploy.zip`
   - Configure and deploy

## What to Share

To help you better, please share:
1. **Screenshot of Build History** (click Build History in Cloud Run)
2. **Any error messages** from the logs
3. **Service status** (green checkmark or red error?)

Then I can give you the exact fix!
