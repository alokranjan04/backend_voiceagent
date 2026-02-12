# MCP Server Testing Guide

## Prerequisites

Before testing, ensure:
1. ✅ Express server is running (`npm run dev`)
2. ✅ You've authenticated at `http://localhost:8080/auth`
3. ✅ OAuth tokens are active

## Method 1: Test with Claude Desktop (Easiest)

### Setup

1. **Create/Edit Claude Desktop config**:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **Add this configuration**:
   ```json
   {
     "mcpServers": {
       "google-calendar-gmail": {
         "command": "node",
         "args": ["C:\\Users\\Alok Ranjan\\Documents\\Backend VoiceAgent\\mcp-server.js"]
       }
     }
   }
   ```

3. **Restart Claude Desktop**

### Test Examples

Ask Claude:
- "Create a calendar event for tomorrow at 3 PM with Sarah Johnson for 45 minutes"
- "List all my calendar events for next week"
- "Get details of event ID [paste event ID]"
- "Update event [event ID] to start at 4 PM instead"
- "Delete event [event ID]"
- "Send an email to test@example.com with subject 'Test' and body 'Hello!'"

---

## Method 2: Test with MCP Inspector

### Install MCP Inspector

```bash
npx @modelcontextprotocol/inspector node mcp-server.js
```

This opens a web interface where you can:
- See all available tools
- Test each tool with custom inputs
- View responses in real-time

---

## Method 3: Manual Testing with Node.js

### Create a test script

Create `test-mcp.js`:

```javascript
const { spawn } = require('child_process');

// Start MCP server
const mcp = spawn('node', ['mcp-server.js']);

// Send list tools request
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

mcp.stdin.write(JSON.stringify(listToolsRequest) + '\n');

// Listen for response
mcp.stdout.on('data', (data) => {
  console.log('Response:', data.toString());
});

mcp.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});
```

Run: `node test-mcp.js`

---

## Method 4: Test Individual Functions Directly

### Create a simple test file

Create `test-calendar.js`:

```javascript
require('dotenv').config();
const {
  createCalendarEvent,
  getCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent
} = require('./services/calendarService');

async function test() {
  try {
    // Test 1: Create event
    console.log('Creating event...');
    const event = await createCalendarEvent(
      'Test User',
      '2026-02-20T15:00:00+05:30',
      30
    );
    console.log('Created:', event);

    // Test 2: Get event
    console.log('\nGetting event...');
    const retrieved = await getCalendarEvent(event.id);
    console.log('Retrieved:', retrieved);

    // Test 3: List events
    console.log('\nListing events...');
    const events = await listCalendarEvents(
      '2026-02-01T00:00:00+05:30',
      '2026-02-28T23:59:59+05:30',
      10
    );
    console.log('Found', events.length, 'events');

    // Test 4: Update event
    console.log('\nUpdating event...');
    const updated = await updateCalendarEvent(event.id, {
      name: 'Updated User',
      duration: 45
    });
    console.log('Updated:', updated);

    // Test 5: Delete event
    console.log('\nDeleting event...');
    const deleted = await deleteCalendarEvent(event.id);
    console.log('Deleted:', deleted);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
```

Run: `node test-calendar.js`

---

## Quick Verification Steps

### 1. Check MCP Server Starts

```bash
npm run mcp
```

You should see:
```
Google Calendar & Gmail MCP Server running on stdio
```

### 2. Verify Tools Are Listed

The MCP server should respond to tool list requests with all 8 tools:
- createCalendarEvent
- getCalendarEvent
- updateCalendarEvent
- deleteCalendarEvent
- listCalendarEvents
- sendEmail
- sendMeetingConfirmation
- createMeetingWithEmail

### 3. Test Authentication

If you see "Not authenticated" error:
1. Make sure Express server is running: `npm run dev`
2. Visit `http://localhost:8080/auth` to authenticate
3. Keep Express server running while using MCP

---

## Troubleshooting

### "Not authenticated" error
- Authenticate via Express server first
- Keep Express server running in background

### "Module not found" error
- Run `npm install` to ensure all dependencies are installed

### MCP server not responding
- Check that stdio transport is working
- Verify Node.js version (should be 16+)

### Calendar/Email operations fail
- Check OAuth tokens are valid
- Verify Google Cloud Console APIs are enabled
- Check internet connection

---

## Recommended Testing Order

1. **Start Express server**: `npm run dev`
2. **Authenticate**: Visit `http://localhost:8080/auth`
3. **Test webhook first**: `curl -X POST http://localhost:8080/vapi-webhook -H "Content-Type: application/json" -d @test-payload.json`
4. **Configure Claude Desktop** with MCP server
5. **Test MCP tools** through Claude Desktop
6. **Verify** calendar events and emails in Google Calendar/Gmail

---

## Example Test Workflow

1. **Create an event** via MCP
2. **Check Google Calendar** - event should appear
3. **Get event details** using the event ID
4. **Update the event** time or duration
5. **List events** to see all upcoming events
6. **Delete the test event**
7. **Send a test email** to yourself
8. **Check Gmail** for the email

This ensures all CRUD operations work correctly!
