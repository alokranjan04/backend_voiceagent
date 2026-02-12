const { google } = require("googleapis");
const { getAuthClient } = require("../config/oauth");

/**
 * Create a calendar event
 * @param {string} name - Name of the person for the meeting
 * @param {string} time - ISO 8601 datetime string for meeting start
 * @param {number} durationMinutes - Duration of meeting in minutes (default: 30)
 * @returns {Promise<Object>} Created event details
 */
async function createCalendarEvent(name, time, durationMinutes = 30) {
    try {
        // Validate input
        if (!name || !time) {
            throw new Error("Name and time are required");
        }

        const startTime = new Date(time);
        if (isNaN(startTime.getTime())) {
            throw new Error("Invalid time format. Use ISO 8601 format.");
        }

        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        // Get authenticated client
        const auth = getAuthClient();
        const calendar = google.calendar({ version: "v3", auth });

        // Create event
        const event = {
            summary: `Meeting with ${name}`,
            description: `Scheduled meeting with ${name}`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: "Asia/Kolkata", // Adjust based on your timezone
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: "Asia/Kolkata",
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "email", minutes: 24 * 60 },
                    { method: "popup", minutes: 10 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: event,
        });

        console.log(`Calendar event created: ${response.data.htmlLink}`);

        return {
            id: response.data.id,
            link: response.data.htmlLink,
            start: response.data.start.dateTime,
            end: response.data.end.dateTime,
        };
    } catch (error) {
        console.error("Error creating calendar event:", error.message);
        throw new Error(`Failed to create calendar event: ${error.message}`);
    }
}

/**
 * Get a calendar event by ID
 * @param {string} eventId - Google Calendar event ID
 * @returns {Promise<Object>} Event details
 */
async function getCalendarEvent(eventId) {
    try {
        if (!eventId) {
            throw new Error("Event ID is required");
        }

        const auth = getAuthClient();
        const calendar = google.calendar({ version: "v3", auth });

        const response = await calendar.events.get({
            calendarId: "primary",
            eventId: eventId,
        });

        console.log(`Retrieved event: ${response.data.summary}`);

        return {
            id: response.data.id,
            summary: response.data.summary,
            description: response.data.description,
            start: response.data.start.dateTime || response.data.start.date,
            end: response.data.end.dateTime || response.data.end.date,
            link: response.data.htmlLink,
            attendees: response.data.attendees || [],
            status: response.data.status,
        };
    } catch (error) {
        console.error("Error getting calendar event:", error.message);
        throw new Error(`Failed to get calendar event: ${error.message}`);
    }
}

/**
 * Update a calendar event
 * @param {string} eventId - Event ID to update
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated event details
 */
async function updateCalendarEvent(eventId, updates) {
    try {
        if (!eventId) {
            throw new Error("Event ID is required");
        }

        const auth = getAuthClient();
        const calendar = google.calendar({ version: "v3", auth });

        // Get existing event first
        const existing = await calendar.events.get({
            calendarId: "primary",
            eventId: eventId,
        });

        // Build update object
        const eventUpdate = { ...existing.data };

        if (updates.name) {
            eventUpdate.summary = `Meeting with ${updates.name}`;
        }

        if (updates.description) {
            eventUpdate.description = updates.description;
        }

        if (updates.time) {
            const startTime = new Date(updates.time);
            if (isNaN(startTime.getTime())) {
                throw new Error("Invalid time format");
            }

            const duration = updates.duration || 30;
            const endTime = new Date(startTime.getTime() + duration * 60000);

            eventUpdate.start = {
                dateTime: startTime.toISOString(),
                timeZone: "Asia/Kolkata",
            };
            eventUpdate.end = {
                dateTime: endTime.toISOString(),
                timeZone: "Asia/Kolkata",
            };
        } else if (updates.duration) {
            // Update duration only
            const startTime = new Date(existing.data.start.dateTime);
            const endTime = new Date(startTime.getTime() + updates.duration * 60000);
            eventUpdate.end = {
                dateTime: endTime.toISOString(),
                timeZone: "Asia/Kolkata",
            };
        }

        const response = await calendar.events.update({
            calendarId: "primary",
            eventId: eventId,
            requestBody: eventUpdate,
        });

        console.log(`Event updated: ${response.data.htmlLink}`);

        return {
            id: response.data.id,
            summary: response.data.summary,
            start: response.data.start.dateTime,
            end: response.data.end.dateTime,
            link: response.data.htmlLink,
        };
    } catch (error) {
        console.error("Error updating calendar event:", error.message);
        throw new Error(`Failed to update calendar event: ${error.message}`);
    }
}

/**
 * Delete a calendar event
 * @param {string} eventId - Event ID to delete
 * @returns {Promise<Object>} Confirmation message
 */
async function deleteCalendarEvent(eventId) {
    try {
        if (!eventId) {
            throw new Error("Event ID is required");
        }

        const auth = getAuthClient();
        const calendar = google.calendar({ version: "v3", auth });

        await calendar.events.delete({
            calendarId: "primary",
            eventId: eventId,
        });

        console.log(`Event deleted: ${eventId}`);

        return {
            success: true,
            message: `Event ${eventId} deleted successfully`,
        };
    } catch (error) {
        console.error("Error deleting calendar event:", error.message);
        throw new Error(`Failed to delete calendar event: ${error.message}`);
    }
}

/**
 * List calendar events within a date range
 * @param {string} startDate - Start date (ISO 8601)
 * @param {string} endDate - End date (ISO 8601)
 * @param {number} maxResults - Maximum number of results (default: 10)
 * @returns {Promise<Array>} List of events
 */
async function listCalendarEvents(startDate, endDate, maxResults = 10) {
    try {
        if (!startDate || !endDate) {
            throw new Error("Start date and end date are required");
        }

        const auth = getAuthClient();
        const calendar = google.calendar({ version: "v3", auth });

        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date(startDate).toISOString(),
            timeMax: new Date(endDate).toISOString(),
            maxResults: maxResults,
            singleEvents: true,
            orderBy: "startTime",
        });

        const events = response.data.items || [];
        console.log(`Found ${events.length} events`);

        return events.map((event) => ({
            id: event.id,
            summary: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            link: event.htmlLink,
            status: event.status,
        }));
    } catch (error) {
        console.error("Error listing calendar events:", error.message);
        throw new Error(`Failed to list calendar events: ${error.message}`);
    }
}

module.exports = {
    createCalendarEvent,
    getCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    listCalendarEvents,
};
