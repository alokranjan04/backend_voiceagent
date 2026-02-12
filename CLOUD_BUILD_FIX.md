# Fixing Cloud Build Error

## Quick Fix: Add .gcloudignore

The build might be failing because it's trying to upload unnecessary files. Create a `.gcloudignore` file:

```
node_modules/
.git/
.env
*.md
test-*.js
mcp-server.js
calendar-gmail-webhook-deploy.zip
deploy-temp/
```

## Environment Variables Setup

### Step 1: Wait for Build to Complete

Even if the build fails initially, Cloud Run will create a service. You can then:

1. Go to: https://console.cloud.google.com/run
2. Find your service in the list
3. Click on it

### Step 2: Add Environment Variables

1. Click **"EDIT & DEPLOY NEW REVISION"**
2. Scroll to **"Container, Variables & Secrets, Connections"**
3. Click **"Variables & Secrets"** tab
4. Click **"+ ADD VARIABLE"** for each:

```
CLIENT_ID = 101257437274-9p20p1jo0ovin7k9cdfuk5nvhdkv0o31
CLIENT_SECRET = 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
PORT = 8080
REDIRECT_URI = (leave blank initially)
```

5. Click **"DEPLOY"**

### Step 3: After Successful Deployment

1. Copy your service URL (e.g., `https://your-service.run.app`)
2. Edit the service again
3. Update `REDIRECT_URI` to: `https://your-service.run.app/auth/callback`
4. Deploy again

## Common Build Errors & Fixes

### Error: "npm install failed"
**Fix:** Make sure `package-lock.json` is in the repository

### Error: "Cannot find Dockerfile"
**Fix:** Dockerfile should be in the root directory

### Error: "Port not specified"
**Fix:** Add PORT=8080 environment variable

### Error: "Module not found"
**Fix:** Check that all dependencies are in package.json

## Alternative: Deploy with gcloud CLI

If Cloud Build continues to fail, you can deploy directly:

```bash
gcloud run deploy calendar-gmail-webhook \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars CLIENT_ID=101257437274-9p20p1jo0ovin7k9cdfuk5nvhdkv0o31,CLIENT_SECRET=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,PORT=8080
```

## Need More Help?

Click on the **failed build** in the dashboard to see the detailed error logs, then share the error message.
