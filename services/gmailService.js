const { google } = require("googleapis");
const { getAuthClient } = require("../config/oauth");

/**
 * Send an email via Gmail
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body (plain text)
 * @returns {Promise<Object>} Sent message details
 */
async function sendEmail(to, subject, body) {
    try {
        // Validate input
        if (!to || !subject || !body) {
            throw new Error("To, subject, and body are required");
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            throw new Error("Invalid email address");
        }

        // Get authenticated client
        const auth = getAuthClient();
        const gmail = google.gmail({ version: "v1", auth });

        // Create MIME message
        const message = [
            `To: ${to}`,
            `Subject: ${subject}`,
            "Content-Type: text/plain; charset=utf-8",
            "",
            body,
        ].join("\n");

        // Encode message in base64url format
        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        // Send email
        const response = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });

        console.log(`Email sent successfully. Message ID: ${response.data.id}`);

        return {
            id: response.data.id,
            threadId: response.data.threadId,
        };
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

/**
 * Send a meeting confirmation email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} meetingTime - Meeting start time
 * @param {string} calendarLink - Google Calendar event link
 */
async function sendMeetingConfirmation(to, name, meetingTime, calendarLink) {
    const subject = "Meeting Confirmation";

    const body = `Hi ${name},

Your meeting has been confirmed!

Meeting Details:
- Date & Time: ${new Date(meetingTime).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        dateStyle: "full",
        timeStyle: "short",
    })}
- Duration: 30 minutes

Calendar Event: ${calendarLink || "Check your Google Calendar"}

If you need to reschedule or have any questions, please let us know.

Best regards,
Your Team`;

    return sendEmail(to, subject, body);
}

module.exports = {
    sendEmail,
    sendMeetingConfirmation,
};
