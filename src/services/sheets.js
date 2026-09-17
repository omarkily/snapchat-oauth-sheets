const { google } = require("googleapis");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Google Sheets Service
 * Handles data logging to Google Sheets
 */
class SheetsService {
  constructor() {
    this.sheets = null;
    this.initialized = false;
  }

  /**
   * Initialize Google Sheets API client
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: config.googleSheets.credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const authClient = await auth.getClient();
      this.sheets = google.sheets({ version: "v4", auth: authClient });
      this.initialized = true;
      logger.info("Google Sheets client initialized");
    } catch (error) {
      logger.error("Failed to initialize Google Sheets client", error);
      throw error;
    }
  }

  /**
   * Append a row to the configured Google Sheet
   * @param {Object} data - Data to log
   * @returns {Promise<boolean>} - Success status
   */
  async appendRow(data) {
    await this.initialize();

    const row = [
      data.snapchat_id || "",
      data.display_name || "",
      data.event_type || "",
      JSON.stringify(data.metadata || {}),
      data.timestamp || new Date().toISOString(),
    ];

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= config.retry.maxAttempts; attempt++) {
      try {
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: config.googleSheets.spreadsheetId,
          range: `${config.googleSheets.sheetName}!A:E`,
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          resource: {
            values: [row],
          },
        });

        logger.info("Successfully appended row to Google Sheet", {
          event_type: data.event_type,
          snapchat_id: data.snapchat_id,
        });
        return true;
      } catch (error) {
        logger.warn(`Sheet write attempt ${attempt} failed`, { error: error.message });

        if (attempt === config.retry.maxAttempts) {
          logger.error("All retry attempts exhausted for sheet write", error);
          throw new Error("Failed to write to Google Sheet after retries");
        }

        // Exponential backoff
        const delay = config.retry.baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Log a login event
   * @param {Object} userProfile - User profile from Snapchat
   */
  async logLoginEvent(userProfile) {
    return this.appendRow({
      ...userProfile,
      event_type: "login",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log a lens action event
   * @param {Object} eventData - Lens event data
   */
  async logLensEvent(eventData) {
    return this.appendRow({
      snapchat_id: eventData.user_id || eventData.snapchat_id,
      display_name: eventData.display_name || "",
      event_type: "lens_action",
      metadata: eventData,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new SheetsService();
