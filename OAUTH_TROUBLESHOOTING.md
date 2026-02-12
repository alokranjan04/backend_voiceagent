# OAuth Troubleshooting Guide

## Current Error
**Error 400: redirect_uri_mismatch**
```
Request details: redirect_uri=http://localhost:8080/auth/callback
```

## Your Current Configuration

### .env File (Confirmed ✓)
```env
CLIENT_ID=your_client_id_here.apps.googleusercontent.com
CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://localhost:8080/auth/callback
PORT=8080
```

## Troubleshooting Steps

### Step 1: Verify Google Cloud Console Configuration

Go to: https://console.cloud.google.com/apis/credentials

1. Find your OAuth 2.0 Client ID
2. Click on it to edit
3. Under **"Authorized redirect URIs"**, verify you have EXACTLY:
   ```
   http://localhost:8080/auth/callback
   ```
   
**Important checks:**
- ✓ No trailing slash
- ✓ Uses `http://` not `https://`
- ✓ Port is `8080` not `3000`
- ✓ No extra spaces before or after
- ✓ Click "Save" button at the bottom

### Step 2: Wait for Propagation
Google OAuth changes can take **5-10 minutes** to propagate. After saving:
- Wait at least 5 minutes
- Try in a new incognito/private browser window

### Step 3: Verify the Correct Client ID is Being Used

**Check if you have multiple OAuth clients:**
1. Go to Google Cloud Console → Credentials
2. Look for multiple "OAuth 2.0 Client IDs"
3. Make sure you're editing the correct one that matches your .env file

### Step 4: Restart the Server

After making changes in Google Cloud Console:
```bash
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
npm run dev
```

### Step 5: Alternative - Create a New OAuth Client

If the issue persists, create a fresh OAuth client:

1. **In Google Cloud Console:**
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - Name: `Calendar Gmail Server`
   - Authorized redirect URIs: `http://localhost:8080/auth/callback`
   - Click **Create**

2. **Copy the new credentials:**
   - Copy the new Client ID
   - Copy the new Client Secret

3. **Update your .env file:**
   ```env
   CLIENT_ID=<new_client_id>
   CLIENT_SECRET=<new_client_secret>
   REDIRECT_URI=http://localhost:8080/auth/callback
   PORT=8080
   ```

4. **Restart the server:**
   ```bash
   npm run dev
   ```

5. **Try authentication:**
   ```
   http://localhost:8080/auth
   ```

### Step 6: Check OAuth Consent Screen

Make sure your OAuth consent screen is configured:

1. Go to: APIs & Services → OAuth consent screen
2. User Type: **External** (for testing)
3. Add your email as a test user under "Test users"
4. Save

### Step 7: Enable Required APIs

Verify these APIs are enabled:
1. Go to: APIs & Services → Enabled APIs & services
2. Make sure these are enabled:
   - **Google Calendar API**
   - **Gmail API**

If not enabled:
1. Click "+ ENABLE APIS AND SERVICES"
2. Search for "Google Calendar API" → Enable
3. Search for "Gmail API" → Enable

## Quick Verification Checklist

- [ ] Redirect URI in Google Cloud Console is exactly: `http://localhost:8080/auth/callback`
- [ ] Clicked "Save" in Google Cloud Console
- [ ] Waited 5+ minutes after saving
- [ ] Using the correct Client ID (matches .env file)
- [ ] OAuth consent screen is configured
- [ ] Test user added (your email)
- [ ] Google Calendar API is enabled
- [ ] Gmail API is enabled
- [ ] Server restarted after changes
- [ ] Tried in incognito/private window

## Still Not Working?

If you've tried all the above and it still doesn't work, the most reliable solution is:

**Create a completely new OAuth 2.0 Client ID** (Step 5 above) and use those fresh credentials. This eliminates any potential caching or configuration issues with the existing client.
