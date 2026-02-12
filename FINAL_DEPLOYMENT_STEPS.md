# Cloud Run Deployment - Final Steps

## ✅ Deployment Status

**Service URL:** `https://backend-voiceagent-git-101257437274.europe-west1.run.app`

**Current Status:** Service is deployed but showing placeholder page because the build is still in progress or environment variables are missing.

## Next Steps

### Step 1: Access Cloud Run Service Page

Click the blue button **"BACK TO CLOUD RUN"** on the placeholder page, or visit:
https://console.cloud.google.com/run/detail/europe-west1/backend-voiceagent-git

### Step 2: Add Environment Variables

1. Click **"Edit & deploy new revision"** button
2. Scroll to **"Container, Variables & Secrets, Connections"**
3. Expand **"Variables & Secrets"** section
4. Click **"+ ADD VARIABLE"** for each:

```
CLIENT_ID = 101257437274-9p20p1jo0ovin7k9cdfuk5nvhdkv0o31
CLIENT_SECRET = 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
PORT = 8080
REDIRECT_URI = https://backend-voiceagent-git-101257437274.europe-west1.run.app/auth/callback
```

5. Click **"DEPLOY"** at the bottom

### Step 3: Update Google OAuth Settings

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://backend-voiceagent-git-101257437274.europe-west1.run.app/auth/callback
   ```
4. Click **"SAVE"**
5. Wait 2-3 minutes for propagation

### Step 4: Authenticate

Visit: `https://backend-voiceagent-git-101257437274.europe-west1.run.app/auth`

Complete the OAuth flow to authorize the application.

### Step 5: Test Webhook

```bash
curl -X POST https://backend-voiceagent-git-101257437274.europe-west1.run.app/vapi-webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","time":"2026-02-20T10:00:00+05:30"}'
```

### Step 6: Configure VAPI

Use this webhook URL in your VAPI dashboard:
```
https://backend-voiceagent-git-101257437274.europe-west1.run.app/vapi-webhook
```

## Troubleshooting

**If you see the placeholder page:**
- The build is still in progress (wait 2-5 minutes)
- Check Build History for errors
- Environment variables might be missing

**If you get "Not authenticated" error:**
- Make sure you've added all 4 environment variables
- Visit the `/auth` endpoint to authenticate
- Verify OAuth redirect URI is added in Google Cloud Console

## Your Deployment URLs

- **Service:** https://backend-voiceagent-git-101257437274.europe-west1.run.app
- **Auth:** https://backend-voiceagent-git-101257437274.europe-west1.run.app/auth
- **Webhook:** https://backend-voiceagent-git-101257437274.europe-west1.run.app/vapi-webhook
- **Callback:** https://backend-voiceagent-git-101257437274.europe-west1.run.app/auth/callback
