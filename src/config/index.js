require("dotenv").config();

module.exports = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Snapchat OAuth
  snapchat: {
    clientId: process.env.SNAPCHAT_CLIENT_ID,
    clientSecret: process.env.SNAPCHAT_CLIENT_SECRET,
    redirectUri: process.env.SNAPCHAT_REDIRECT_URI || "http://localhost:3000/snapchat/callback",
    authUrl: "https://accounts.snapchat.com/accounts/oauth2/auth",
    tokenUrl: "https://accounts.snapchat.com/accounts/oauth2/token",
    apiUrl: "https://kit.snapchat.com/v1",
    scopes: [
      "https://auth.snapchat.com/oauth2/api/user.display_name",
      "https://auth.snapchat.com/oauth2/api/user.external_id",
    ],
  },

  // Google Sheets
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    sheetName: process.env.GOOGLE_SHEET_NAME || "Sheet1",
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
  },
};
