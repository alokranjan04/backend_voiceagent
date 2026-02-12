# Testing Guide for Google Calendar & Gmail Server

## ✅ Server Status Check (Already Tested)

The server is running successfully at `http://localhost:8080`

```bash
curl http://localhost:8080/
```

**Response:**
```json
{
  "status": "Server is running",
  "authenticated": false,
  "message": "Please authenticate at /auth",
  "endpoints": {
    "auth": "/auth",
    "webhook": "/vapi-webhook"
  }
}
```

## Step 1: Update Google Cloud Console

**IMPORTANT**: Before authenticating, update your OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   http://localhost:8080/auth/callback
   ```
4. Click "Save"

## Step 2: Authenticate with Google

### Option A: Using Your Browser (Recommended)
1. Open your browser
2. Navigate to: `http://localhost:8080/auth`
3. Sign in with your Google account
4. Grant permissions for:
   - Google Calendar API
   - Gmail API
5. You'll be redirected to a success page

### Option B: Using Command Line
```bash
# This will show you the auth URL
curl http://localhost:8080/auth
```
Copy the redirect URL and paste it in your browser.

## Step 3: Test the Webhook Endpoint

After authentication, test creating a calendar event and sending an email:

### Test Command

```bash
curl -X POST http://localhost:8080/vapi-webhook \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test User\", \"email\": \"YOUR_EMAIL@gmail.com\", \"time\": \"2026-02-15T14:00:00+05:30\"}"
```

**Replace `YOUR_EMAIL@gmail.com` with your actual email address.**

### Expected Success Response

```json
{
  "status": "Success",
  "message": "Calendar event created and confirmation email sent",
  "data": {
    "calendar": {
      "eventId": "abc123xyz...",
      "link": "https://calendar.google.com/calendar/event?eid=...",
      "start": "2026-02-15T14:00:00+05:30",
      "end": "2026-02-15T14:30:00+05:30"
    },
    "email": {
      "messageId": "18d4f5e6...",
      "recipient": "YOUR_EMAIL@gmail.com"
    }
  }
}
```

### What to Verify

1. **Google Calendar**: Check your calendar for a new event titled "Meeting with Test User"
2. **Gmail**: Check your inbox for a confirmation email

## Step 4: Test Error Handling

### Test without authentication (if you haven't authenticated yet)
```bash
curl -X POST http://localhost:8080/vapi-webhook \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test\", \"email\": \"test@example.com\", \"time\": \"2026-02-15T14:00:00+05:30\"}"
```

**Expected Response:**
```json
{
  "error": "Not authenticated",
  "message": "Please complete OAuth flow at /auth first"
}
```

### Test with missing fields
```bash
curl -X POST http://localhost:8080/vapi-webhook \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test User\"}"
```

**Expected Response:**
```json
{
  "error": "Missing required fields",
  "message": "Required fields: name, email, time",
  "received": {
    "name": true,
    "email": false,
    "time": false
  }
}
```

### Test with invalid email
```bash
curl -X POST http://localhost:8080/vapi-webhook \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test\", \"email\": \"invalid-email\", \"time\": \"2026-02-15T14:00:00+05:30\"}"
```

**Expected Response:**
```json
{
  "error": "Webhook processing failed",
  "message": "Failed to send email: Invalid email address"
}
```

## Step 5: Integration with VAPI

Once tested, you can configure VAPI to call your webhook:

1. In VAPI dashboard, add a server URL function
2. Set the URL to: `http://localhost:8080/vapi-webhook` (or your deployed URL)
3. Configure the function to send `name`, `email`, and `time` parameters

### Example VAPI Configuration

```json
{
  "type": "server",
  "url": "http://localhost:8080/vapi-webhook",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

## Troubleshooting

### "Not authenticated" error
- Visit `http://localhost:8080/auth` to authenticate
- Make sure you granted all permissions

### "Token expired" error
- The server automatically refreshes tokens
- If it persists, re-authenticate at `/auth`

### Calendar event not showing
- Check the timezone in `services/calendarService.js` (currently set to "Asia/Kolkata")
- Verify the time format is ISO 8601

### Email not received
- Check spam folder
- Verify the email address is correct
- Check Gmail API is enabled in Google Cloud Console

## Quick Test Script

Save this as `test.ps1` for easy testing:

```powershell
# Test 1: Server status
Write-Host "Testing server status..." -ForegroundColor Cyan
curl http://localhost:8080/

# Test 2: Webhook (replace with your email)
Write-Host "`nTesting webhook..." -ForegroundColor Cyan
$body = @{
    name = "Test User"
    email = "your-email@gmail.com"
    time = "2026-02-15T14:00:00+05:30"
} | ConvertTo-Json

curl -X POST http://localhost:8080/vapi-webhook `
  -H "Content-Type: application/json" `
  -d $body
```

Run with: `.\test.ps1`
