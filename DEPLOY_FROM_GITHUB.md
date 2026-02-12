# Deploy from GitHub to Google Cloud Run

Your code is now on GitHub! 🎉
**Repository:** https://github.com/alokranjan04/backend_voiceagent.git

## Next Steps: Deploy to Cloud Run

### Option 1: Deploy via Google Cloud Console (Easiest)

1. **Go to Cloud Run Console**
   - Visit: https://console.cloud.google.com/run
   - Click **"CREATE SERVICE"**

2. **Select Source**
   - Choose **"Continuously deploy from a repository"**
   - Click **"SET UP WITH CLOUD BUILD"**

3. **Connect Repository**
   - Click **"Connect to GitHub"**
   - Authorize Google Cloud Build
   - Select repository: `alokranjan04/backend_voiceagent`
   - Branch: `main`
   - Click **"NEXT"**

4. **Configure Build**
   - Build type: **Dockerfile**
   - Dockerfile location: `/Dockerfile`
   - Click **"SAVE"**

5. **Configure Service**
   - **Service name**: `calendar-gmail-webhook`
   - **Region**: `us-central1` (or your preferred region)
   - **CPU allocation**: CPU is only allocated during request processing
   - **Min instances**: 0
   - **Max instances**: 10
   - **Authentication**: ✅ Allow unauthenticated invocations

6. **Container Settings**
   - **Port**: `8080`
   - **Memory**: `512 MiB`
   - **CPU**: `1`

7. **Add Environment Variables**
   
   Click **"Container, Variables & Secrets, Connections"** → **"Variables"** tab
   
   Add these variables:
   ```
   CLIENT_ID = 101257437274-9p20p1jo0ovin7k9cdfuk5nvhdkv0o31
   CLIENT_SECRET = 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
   REDIRECT_URI = (leave blank for now)
   PORT = 8080
   ```

8. **Deploy**
   - Click **"CREATE"**
   - Wait 3-5 minutes for deployment

9. **Get Your URL**
   - After deployment, you'll see a URL like:
   - `https://calendar-gmail-webhook-xyz.run.app`

10. **Update Environment Variables**
    - Go back to your service
    - Click **"EDIT & DEPLOY NEW REVISION"**
    - Update `REDIRECT_URI` to: `https://your-actual-url.run.app/auth/callback`
    - Click **"DEPLOY"**

11. **Update OAuth Settings**
    - Go to: https://console.cloud.google.com/apis/credentials
    - Click on your OAuth Client ID
    - Add redirect URI: `https://your-actual-url.run.app/auth/callback`
    - Click **"SAVE"**
    - Wait 2-3 minutes for propagation

12. **Authenticate**
    - Visit: `https://your-actual-url.run.app/auth`
    - Complete OAuth flow

13. **Test Webhook**
    ```bash
    curl -X POST https://your-actual-url.run.app/vapi-webhook \
      -H "Content-Type: application/json" \
      -d '{"name":"Test","email":"test@example.com","time":"2026-02-20T10:00:00+05:30"}'
    ```

14. **Use in VAPI**
    - Webhook URL: `https://your-actual-url.run.app/vapi-webhook`

---

### Option 2: Deploy via gcloud CLI

If you install gcloud CLI later, you can deploy with:

```bash
gcloud run deploy calendar-gmail-webhook \
  --source https://github.com/alokranjan04/backend_voiceagent \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Important Notes

✅ **Security**: All credentials are in `.env` (not pushed to GitHub)
✅ **Environment Variables**: Set via Cloud Run console
✅ **OAuth**: Update redirect URI after getting Cloud Run URL
✅ **VAPI**: Use the `/vapi-webhook` endpoint

---

## Troubleshooting

### "Not authenticated" error
- Visit your `/auth` endpoint to authenticate
- OAuth tokens are stored in memory (restart service to re-authenticate)

### Webhook not working
- Check Cloud Run logs
- Verify environment variables are set
- Ensure OAuth redirect URI is updated

---

## Your Credentials (for Cloud Run environment variables)

```
CLIENT_ID=101257437274-9p20p1jo0ovin7k9cdfuk5nvhdkv0o31
CLIENT_SECRET=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
```

**⚠️ Keep these secure! Only add them to Cloud Run environment variables, never commit to Git.**
