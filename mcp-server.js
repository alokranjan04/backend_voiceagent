#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

require("dotenv").config();

const { isAuthenticated } = require("./config/oauth");
const {
    createCalendarEvent,
    getCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    listCalendarEvents,
} = require("./services/calendarService");
const {
    sendEmail,
    sendMeetingConfirmation,
} = require("./services/gmailService");

// Create MCP server
const server = new Server(
    {
        name: "google-calendar-gmail-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Tool definitions
const TOOLS = [
    {
        name: "createCalendarEvent",
        description:
            "Create a new Google Calendar event with specified name, time, and duration",
        inputSchema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Name of the person or event title",
                },
                time: {
                    type: "string",
                    description: "Start time in ISO 8601 format (e.g., 2026-02-15T14:00:00+05:30)",
                },
                duration: {
                    type: "number",
                    description: "Duration in minutes (default: 30)",
                },
            },
            required: ["name", "time"],
        },
    },
    {
        name: "getCalendarEvent",
        description: "Retrieve details of a specific calendar event by its ID",
        inputSchema: {
            type: "object",
            properties: {
                eventId: {
                    type: "string",
                    description: "Google Calendar event ID",
                },
            },
            required: ["eventId"],
        },
    },
    {
        name: "updateCalendarEvent",
        description: "Update an existing calendar event's details",
        inputSchema: {
            type: "object",
            properties: {
                eventId: {
                    type: "string",
                    description: "Event ID to update",
                },
                updates: {
                    type: "object",
                    description: "Fields to update",
                    properties: {
                        name: {
                            type: "string",
                            description: "New name/title",
                        },
                        time: {
                            type: "string",
                            description: "New start time (ISO 8601)",
                        },
                        duration: {
                            type: "number",
                            description: "New duration in minutes",
                        },
                        description: {
                            type: "string",
                            description: "New description",
                        },
                    },
                },
            },
            required: ["eventId", "updates"],
        },
    },
    {
        name: "deleteCalendarEvent",
        description: "Delete a calendar event by its ID",
        inputSchema: {
            type: "object",
            properties: {
                eventId: {
                    type: "string",
                    description: "Event ID to delete",
                },
            },
            required: ["eventId"],
        },
    },
    {
        name: "listCalendarEvents",
        description: "List calendar events within a specified date range",
        inputSchema: {
            type: "object",
            properties: {
                startDate: {
                    type: "string",
                    description: "Start date (ISO 8601 format)",
                },
                endDate: {
                    type: "string",
                    description: "End date (ISO 8601 format)",
                },
                maxResults: {
                    type: "number",
                    description: "Maximum number of events to return (default: 10)",
                },
            },
            required: ["startDate", "endDate"],
        },
    },
    {
        name: "sendEmail",
        description: "Send an email via Gmail",
        inputSchema: {
            type: "object",
            properties: {
                to: {
                    type: "string",
                    description: "Recipient email address",
                },
                subject: {
                    type: "string",
                    description: "Email subject",
                },
                body: {
                    type: "string",
                    description: "Email body (plain text)",
                },
            },
            required: ["to", "subject", "body"],
        },
    },
    {
        name: "sendMeetingConfirmation",
        description: "Send a formatted meeting confirmation email",
        inputSchema: {
            type: "object",
            properties: {
                to: {
                    type: "string",
                    description: "Recipient email address",
                },
                name: {
                    type: "string",
                    description: "Recipient name",
                },
                meetingTime: {
                    type: "string",
                    description: "Meeting time (ISO 8601 format)",
                },
                calendarLink: {
                    type: "string",
                    description: "Optional Google Calendar event link",
                },
            },
            required: ["to", "name", "meetingTime"],
        },
    },
    {
        name: "createMeetingWithEmail",
        description:
            "Create a calendar event and send a confirmation email (combined operation)",
        inputSchema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Person name",
                },
                email: {
                    type: "string",
                    description: "Email address",
                },
                time: {
                    type: "string",
                    description: "Meeting time (ISO 8601 format)",
                },
                duration: {
                    type: "number",
                    description: "Duration in minutes (default: 30)",
                },
            },
            required: ["name", "email", "time"],
        },
    },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: TOOLS,
    };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        // Check authentication
        if (!isAuthenticated()) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "Not authenticated",
                            message:
                                "Please authenticate first by running the Express server and visiting /auth",
                        }),
                    },
                ],
            };
        }

        // Handle each tool
        switch (name) {
            case "createCalendarEvent": {
                const result = await createCalendarEvent(
                    args.name,
                    args.time,
                    args.duration
                );
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }

            case "getCalendarEvent": {
                const result = await getCalendarEvent(args.eventId);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }

            case "updateCalendarEvent": {
                const result = await updateCalendarEvent(args.eventId, args.updates);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }

            case "deleteCalendarEvent": {
                const result = await deleteCalendarEvent(args.eventId);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }

            case "listCalendarEvents": {
                const result = await listCalendarEvents(
                    args.startDate,
                    args.endDate,
                    args.maxResults
                );
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }

            case "sendEmail": {
                const result = await sendEmail(args.to, args.subject, args.body);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }

            case "sendMeetingConfirmation": {
                const result = await sendMeetingConfirmation(
                    args.to,
                    args.name,
                    args.meetingTime,
                    args.calendarLink
                );
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }

            case "createMeetingWithEmail": {
                // Create calendar event
                const calendarEvent = await createCalendarEvent(
                    args.name,
                    args.time,
                    args.duration
                );

                // Send confirmation email
                const emailResult = await sendMeetingConfirmation(
                    args.email,
                    args.name,
                    args.time,
                    calendarEvent.link
                );

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(
                                {
                                    calendar: calendarEvent,
                                    email: emailResult,
                                },
                                null,
                                2
                            ),
                        },
                    ],
                };
            }

            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                error: "Unknown tool",
                                message: `Tool '${name}' not found`,
                            }),
                        },
                    ],
                    isError: true,
                };
        }
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        error: error.message,
                        stack: error.stack,
                    }),
                },
            ],
            isError: true,
        };
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Google Calendar & Gmail MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
