const { google } = require("googleapis");
require("dotenv").config();

// OAuth2 scopes required for Calendar and Gmail
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.send",
];

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// In-memory token storage (replace with database in production)
let tokens = null;

/**
 * Get the authorization URL for OAuth flow
 */
function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force consent to get refresh token
  });
}

/**
 * Set credentials from authorization code
 */
async function setCredentialsFromCode(code) {
  const { tokens: newTokens } = await oauth2Client.getToken(code);
  tokens = newTokens;
  oauth2Client.setCredentials(tokens);
  return tokens;
}

/**
 * Get current OAuth2 client (with auto-refresh)
 */
function getAuthClient() {
  if (!tokens) {
    throw new Error("Not authenticated. Please complete OAuth flow first.");
  }
  
  oauth2Client.setCredentials(tokens);
  
  // Set up automatic token refresh
  oauth2Client.on("tokens", (newTokens) => {
    if (newTokens.refresh_token) {
      tokens.refresh_token = newTokens.refresh_token;
    }
    tokens.access_token = newTokens.access_token;
    tokens.expiry_date = newTokens.expiry_date;
    console.log("Tokens refreshed automatically");
  });
  
  return oauth2Client;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return tokens !== null;
}

/**
 * Manually set tokens (for testing or migration)
 */
function setTokens(newTokens) {
  tokens = newTokens;
  oauth2Client.setCredentials(tokens);
}

module.exports = {
  getAuthUrl,
  setCredentialsFromCode,
  getAuthClient,
  isAuthenticated,
  setTokens,
};
