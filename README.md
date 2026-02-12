# Google Calendar & Gmail Integration Server

A Node.js server that integrates with Google Calendar and Gmail APIs to automatically create calendar events and send confirmation emails via webhook.

## Features

- ✅ OAuth2 authentication with Google
- ✅ Automatic token refresh
- ✅ Create Google Calendar events
- ✅ Send Gmail confirmation emails
- ✅ Webhook endpoint for integration with VAPI or other services
- ✅ Comprehensive error handling
- ✅ Request validation

## Prerequisites

1. **Node.js** (v14 or higher)
2. **Google Cloud Project** with Calendar and Gmail APIs enabled
3. **OAuth2 Credentials** (Client ID and Client Secret)

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Calendar API
   - Gmail API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen (add test users if in development)
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/auth/callback`
7. Copy your **Client ID** and **Client Secret**

### 2. Project Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` file with your credentials:

```env
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://localhost:3000/auth/callback
PORT=3000
```

### 4. Start the Server

```bash
npm start
```

### 5. Authenticate with Google

1. Open browser and navigate to: `http://localhost:3000/auth`
2. Sign in with your Google account
3. Grant permissions for Calendar and Gmail access
4. You'll be redirected to a success page

## API Endpoints

### GET `/`
Check server status and authentication state.

**Response:**
```json
{
  "status": "Server is running",
  "authenticated": true,
  "message": "Ready to accept webhook requests"
}
```

### GET `/auth`
Initiate OAuth2 authentication flow. Redirects to Google sign-in.

### POST `/vapi-webhook`
Create calendar event and send confirmation email.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "time": "2026-02-15T14:00:00+05:30"
}
```

**Response:**
```json
{
  "status": "Success",
  "message": "Calendar event created and confirmation email sent",
  "data": {
    "calendar": {
      "eventId": "abc123",
      "link": "https://calendar.google.com/...",
      "start": "2026-02-15T14:00:00+05:30",
      "end": "2026-02-15T14:30:00+05:30"
    },
    "email": {
      "messageId": "xyz789",
      "recipient": "john@example.com"
    }
  }
}
```

## Usage Examples

### Using cURL

```bash
curl -X POST http://localhost:3000/vapi-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "time": "2026-02-15T14:00:00+05:30"
  }'
```

### Using JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/vapi-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    time: '2026-02-15T14:00:00+05:30'
  })
});

const result = await response.json();
console.log(result);
```

## Project Structure

```
Backend VoiceAgent/
├── config/
│   └── oauth.js           # OAuth2 configuration and token management
├── services/
│   ├── calendarService.js # Google Calendar integration
│   └── gmailService.js    # Gmail integration
├── server.js              # Main Express server
├── package.json           # Dependencies
├── .env.example           # Environment variable template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Error Handling

The server includes comprehensive error handling:

- **401 Unauthorized**: Not authenticated - complete OAuth flow first
- **400 Bad Request**: Missing or invalid request parameters
- **500 Internal Server Error**: API failures or server errors

All errors return JSON with descriptive messages:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Token Storage**: Currently uses in-memory storage. For production:
   - Use encrypted database storage
   - Implement secure key management (e.g., AWS KMS, Google Secret Manager)
   - Consider per-user token storage

2. **Environment Variables**: Never commit `.env` file to version control

3. **HTTPS**: Use HTTPS in production (update `REDIRECT_URI` accordingly)

4. **Rate Limiting**: Implement rate limiting for webhook endpoints

5. **Authentication**: Add webhook authentication (API keys, signatures)

## Troubleshooting

### "Not authenticated" error
- Navigate to `/auth` to complete OAuth flow
- Check that your OAuth credentials are correct in `.env`

### "Invalid grant" error
- OAuth consent screen might need reconfiguration
- Try revoking access and re-authenticating

### Calendar/Gmail API errors
- Verify APIs are enabled in Google Cloud Console
- Check that OAuth scopes include calendar and gmail.send

## License

ISC

---

## MCP Server

This project includes an **MCP (Model Context Protocol) server** that exposes Google Calendar and Gmail functionality to AI assistants.

### Features

The MCP server provides **8 tools**:

**Calendar Tools:**
- `createCalendarEvent` - Create new events
- `getCalendarEvent` - Retrieve event details
- `updateCalendarEvent` - Modify existing events
- `deleteCalendarEvent` - Remove events
- `listCalendarEvents` - List events in date range

**Email Tools:**
- `sendEmail` - Send custom emails
- `sendMeetingConfirmation` - Send formatted meeting confirmations

**Combined:**
- `createMeetingWithEmail` - Create event + send confirmation

### Quick Start

1. **Authenticate first** (required):
   ```bash
   npm run dev
   # Visit http://localhost:8080/auth
   ```

2. **Start MCP server**:
   ```bash
   npm run mcp
   ```

3. **Configure your AI assistant** to use the MCP server (see [MCP_USAGE.md](file:///c:/Users/Alok%20Ranjan/Documents/Backend%20VoiceAgent/MCP_USAGE.md))

### Documentation

- Full MCP documentation: [MCP_USAGE.md](file:///c:/Users/Alok%20Ranjan/Documents/Backend%20VoiceAgent/MCP_USAGE.md)
- Tool specifications and examples
- Configuration for Claude Desktop, Cline, and other MCP clients
- Workflow examples and troubleshooting
