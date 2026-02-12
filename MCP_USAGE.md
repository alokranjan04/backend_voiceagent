# MCP Server Usage Guide

## Overview

This MCP (Model Context Protocol) server exposes Google Calendar and Gmail functionality to AI assistants. It provides **8 tools** with full CRUD operations for calendar events and email sending capabilities.

## Prerequisites

1. **Authentication Required**: You must authenticate with Google first by running the Express server:
   ```bash
   npm run dev
   ```
   Then visit `http://localhost:8080/auth` to complete OAuth authentication.

2. **Keep Express Server Running**: The MCP server reuses the OAuth tokens from the Express server, so keep it running in the background.

## Starting the MCP Server

```bash
npm run mcp
```

The server runs on stdio and can be connected to any MCP-compatible client.

## Available Tools

### 1. createCalendarEvent

Create a new calendar event.

**Input:**
```json
{
  "name": "John Doe",
  "time": "2026-02-20T10:00:00+05:30",
  "duration": 60
}
```

**Output:**
```json
{
  "id": "event_id_here",
  "link": "https://calendar.google.com/calendar/event?eid=...",
  "start": "2026-02-20T10:00:00+05:30",
  "end": "2026-02-20T11:00:00+05:30"
}
```

---

### 2. getCalendarEvent

Retrieve details of a specific event.

**Input:**
```json
{
  "eventId": "event_id_here"
}
```

**Output:**
```json
{
  "id": "event_id_here",
  "summary": "Meeting with John Doe",
  "description": "Scheduled meeting with John Doe",
  "start": "2026-02-20T10:00:00+05:30",
  "end": "2026-02-20T11:00:00+05:30",
  "link": "https://calendar.google.com/...",
  "attendees": [],
  "status": "confirmed"
}
```

---

### 3. updateCalendarEvent

Update an existing event.

**Input:**
```json
{
  "eventId": "event_id_here",
  "updates": {
    "name": "Jane Smith",
    "time": "2026-02-20T14:00:00+05:30",
    "duration": 45,
    "description": "Updated meeting details"
  }
}
```

**Output:**
```json
{
  "id": "event_id_here",
  "summary": "Meeting with Jane Smith",
  "start": "2026-02-20T14:00:00+05:30",
  "end": "2026-02-20T14:45:00+05:30",
  "link": "https://calendar.google.com/..."
}
```

---

### 4. deleteCalendarEvent

Delete a calendar event.

**Input:**
```json
{
  "eventId": "event_id_here"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Event event_id_here deleted successfully"
}
```

---

### 5. listCalendarEvents

List events within a date range.

**Input:**
```json
{
  "startDate": "2026-02-15T00:00:00+05:30",
  "endDate": "2026-02-28T23:59:59+05:30",
  "maxResults": 20
}
```

**Output:**
```json
[
  {
    "id": "event1_id",
    "summary": "Meeting with John",
    "start": "2026-02-20T10:00:00+05:30",
    "end": "2026-02-20T11:00:00+05:30",
    "link": "https://calendar.google.com/...",
    "status": "confirmed"
  },
  {
    "id": "event2_id",
    "summary": "Team Standup",
    "start": "2026-02-21T09:00:00+05:30",
    "end": "2026-02-21T09:30:00+05:30",
    "link": "https://calendar.google.com/...",
    "status": "confirmed"
  }
]
```

---

### 6. sendEmail

Send a custom email via Gmail.

**Input:**
```json
{
  "to": "recipient@example.com",
  "subject": "Meeting Follow-up",
  "body": "Thank you for the meeting today. Looking forward to our next discussion."
}
```

**Output:**
```json
{
  "id": "message_id_here",
  "threadId": "thread_id_here"
}
```

---

### 7. sendMeetingConfirmation

Send a formatted meeting confirmation email.

**Input:**
```json
{
  "to": "client@example.com",
  "name": "Client Name",
  "meetingTime": "2026-02-20T10:00:00+05:30",
  "calendarLink": "https://calendar.google.com/calendar/event?eid=..."
}
```

**Output:**
```json
{
  "id": "message_id_here",
  "threadId": "thread_id_here"
}
```

---

### 8. createMeetingWithEmail

Create a calendar event and send confirmation email (combined operation).

**Input:**
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "time": "2026-02-22T15:00:00+05:30",
  "duration": 30
}
```

**Output:**
```json
{
  "calendar": {
    "id": "event_id_here",
    "link": "https://calendar.google.com/...",
    "start": "2026-02-22T15:00:00+05:30",
    "end": "2026-02-22T15:30:00+05:30"
  },
  "email": {
    "id": "message_id_here",
    "threadId": "thread_id_here"
  }
}
```

---

## Configuring MCP Clients

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-calendar-gmail": {
      "command": "node",
      "args": ["c:\\Users\\Alok Ranjan\\Documents\\Backend VoiceAgent\\mcp-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Cline (VS Code Extension)

Add to Cline's MCP settings:

```json
{
  "mcpServers": {
    "google-calendar-gmail": {
      "command": "node",
      "args": ["c:\\Users\\Alok Ranjan\\Documents\\Backend VoiceAgent\\mcp-server.js"]
    }
  }
}
```

## Example Workflows

### Workflow 1: Schedule a Meeting

1. **Create event**: Use `createCalendarEvent`
2. **Send confirmation**: Use `sendMeetingConfirmation` with the event link
3. **Or use combined**: Use `createMeetingWithEmail` to do both at once

### Workflow 2: Reschedule a Meeting

1. **List events**: Use `listCalendarEvents` to find the event
2. **Update event**: Use `updateCalendarEvent` with new time
3. **Notify attendee**: Use `sendEmail` to inform about the change

### Workflow 3: Cancel a Meeting

1. **Get event details**: Use `getCalendarEvent`
2. **Delete event**: Use `deleteCalendarEvent`
3. **Send cancellation**: Use `sendEmail` to notify

## Troubleshooting

### "Not authenticated" Error

- Make sure you've authenticated via the Express server first
- Visit `http://localhost:8080/auth` to authenticate
- Keep the Express server running (`npm run dev`)

### Event ID Not Found

- Use `listCalendarEvents` to get valid event IDs
- Event IDs are returned when creating events

### Email Not Sending

- Check that Gmail API is enabled in Google Cloud Console
- Verify the email address is valid
- Check spam folder for sent emails

## Security Notes

- OAuth tokens are stored in memory (shared with Express server)
- For production, implement persistent token storage
- Never commit `.env` file with credentials
- Use environment variables for sensitive data

## Integration Examples

### With AI Assistants

AI assistants can use these tools to:
- Schedule meetings based on natural language requests
- Check calendar availability
- Send follow-up emails
- Manage calendar events (create, update, delete)
- List upcoming events

### Example Conversation

**User**: "Schedule a meeting with John at 2 PM tomorrow for 1 hour"

**AI**: Uses `createCalendarEvent` tool with:
```json
{
  "name": "John",
  "time": "2026-02-13T14:00:00+05:30",
  "duration": 60
}
```

**User**: "Send him a confirmation email"

**AI**: Uses `sendMeetingConfirmation` with the event link from previous response.

---

## Support

For issues or questions:
- Check the main [README.md](file:///c:/Users/Alok%20Ranjan/Documents/Backend%20VoiceAgent/README.md)
- Review [TESTING.md](file:///c:/Users/Alok%20Ranjan/Documents/Backend%20VoiceAgent/TESTING.md) for testing procedures
- See [OAUTH_TROUBLESHOOTING.md](file:///c:/Users/Alok%20Ranjan/Documents/Backend%20VoiceAgent/OAUTH_TROUBLESHOOTING.md) for authentication issues
