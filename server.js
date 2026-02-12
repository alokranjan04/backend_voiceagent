const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const {
    getAuthUrl,
    setCredentialsFromCode,
    isAuthenticated,
} = require("./config/oauth");
const { createCalendarEvent } = require("./services/calendarService");
const { sendMeetingConfirmation } = require("./services/gmailService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ==================== ROUTES ====================

/**
 * Home route - shows authentication status
 */
app.get("/", (req, res) => {
    const authenticated = isAuthenticated();
    res.json({
        status: "Server is running",
        authenticated,
        message: authenticated
            ? "Ready to accept webhook requests"
            : "Please authenticate at /auth",
        endpoints: {
            auth: "/auth",
            webhook: "/vapi-webhook",
        },
    });
});

/**
 * Initiate OAuth flow
 */
app.get("/auth", (req, res) => {
    try {
        const authUrl = getAuthUrl();
        res.redirect(authUrl);
    } catch (error) {
        res.status(500).json({
            error: "Failed to initiate authentication",
            message: error.message,
        });
    }
});

/**
 * OAuth callback handler
 */
app.get("/auth/callback", async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.status(400).json({
            error: "Authentication failed",
            message: error,
        });
    }

    if (!code) {
        return res.status(400).json({
            error: "Missing authorization code",
        });
    }

    try {
        const tokens = await setCredentialsFromCode(code);
        console.log("Authentication successful!");

        res.json({
            success: true,
            message: "Authentication successful! You can now use the webhook.",
            tokens: {
                access_token: tokens.access_token.substring(0, 20) + "...",
                expires_in: tokens.expiry_date
                    ? new Date(tokens.expiry_date).toISOString()
                    : "N/A",
            },
        });
    } catch (error) {
        console.error("OAuth callback error:", error);
        res.status(500).json({
            error: "Failed to complete authentication",
            message: error.message,
        });
    }
});

/**
 * Webhook endpoint for VAPI or other services
 * Creates calendar event and sends confirmation email
 */
app.post("/vapi-webhook", async (req, res) => {
    try {
        // Check authentication
        if (!isAuthenticated()) {
            return res.status(401).json({
                error: "Not authenticated",
                message: "Please complete OAuth flow at /auth first",
            });
        }

        // Validate request body
        const { name, email, time } = req.body;

        if (!name || !email || !time) {
            return res.status(400).json({
                error: "Missing required fields",
                message: "Required fields: name, email, time",
                received: { name: !!name, email: !!email, time: !!time },
            });
        }

        console.log(`Processing webhook for ${name} (${email}) at ${time}`);

        // Create calendar event
        const calendarEvent = await createCalendarEvent(name, time);
        console.log("✓ Calendar event created");

        // Send confirmation email
        const emailResult = await sendMeetingConfirmation(
            email,
            name,
            time,
            calendarEvent.link
        );
        console.log("✓ Confirmation email sent");

        // Success response
        res.json({
            status: "Success",
            message: "Calendar event created and confirmation email sent",
            data: {
                calendar: {
                    eventId: calendarEvent.id,
                    link: calendarEvent.link,
                    start: calendarEvent.start,
                    end: calendarEvent.end,
                },
                email: {
                    messageId: emailResult.id,
                    recipient: email,
                },
            },
        });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({
            error: "Webhook processing failed",
            message: error.message,
        });
    }
});

// ==================== ERROR HANDLING ====================

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        error: "Not found",
        message: `Route ${req.method} ${req.path} not found`,
    });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal server error",
        message: err.message,
    });
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   - GET  /           - Server status`);
    console.log(`   - GET  /auth       - Start OAuth flow`);
    console.log(`   - POST /vapi-webhook - Create event & send email`);
    console.log(`\n${isAuthenticated() ? "✓" : "✗"} Authentication status: ${isAuthenticated() ? "Authenticated" : "Not authenticated"
        }`);

    if (!isAuthenticated()) {
        console.log(`\n⚠️  Please authenticate at http://localhost:${PORT}/auth\n`);
    }
});
