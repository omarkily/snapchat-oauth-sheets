const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const snapchatService = require("../services/snapchat");
const sheetsService = require("../services/sheets");
const logger = require("../utils/logger");

// In-memory state store (use Redis in production)
const stateStore = new Map();

/**
 * GET /snapchat/login
 * Initiates Snapchat OAuth flow
 */
router.get("/login", (req, res) => {
  try {
    // Generate CSRF protection state
    const state = crypto.randomBytes(32).toString("hex");
    stateStore.set(state, { created: Date.now() });

    // Clean up expired states (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, value] of stateStore.entries()) {
      if (value.created < tenMinutesAgo) {
        stateStore.delete(key);
      }
    }

    const authUrl = snapchatService.getAuthorizationUrl(state);
    logger.info("Redirecting to Snapchat OAuth");
    res.redirect(authUrl);
  } catch (error) {
    logger.error("Failed to initiate OAuth", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to initiate login" },
    });
  }
});

/**
 * GET /snapchat/callback
 * Handles OAuth callback from Snapchat
 */
router.get("/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;

  // Handle OAuth errors
  if (error) {
    logger.error("OAuth error from Snapchat", { error, error_description });
    return res.status(400).json({
      success: false,
      error: { message: error_description || error },
    });
  }

  // Validate state to prevent CSRF
  if (!state || !stateStore.has(state)) {
    logger.warn("Invalid or missing state parameter");
    return res.status(400).json({
      success: false,
      error: { message: "Invalid state parameter" },
    });
  }

  // Remove used state
  stateStore.delete(state);

  if (!code) {
    return res.status(400).json({
      success: false,
      error: { message: "Authorization code missing" },
    });
  }

  try {
    // Exchange code for token
    const tokenData = await snapchatService.exchangeCodeForToken(code);

    // Fetch user profile
    const userProfile = await snapchatService.getUserProfile(tokenData.access_token);

    // Log login event to Google Sheets
    await sheetsService.logLoginEvent(userProfile);

    logger.info("OAuth flow completed successfully", {
      snapchat_id: userProfile.snapchat_id,
    });

    // Return success response
    res.json({
      success: true,
      message: "Login successful",
      user: {
        snapchat_id: userProfile.snapchat_id,
        display_name: userProfile.display_name,
      },
    });
  } catch (error) {
    logger.error("OAuth callback failed", error);
    res.status(500).json({
      success: false,
      error: { message: "Authentication failed" },
    });
  }
});

module.exports = router;
