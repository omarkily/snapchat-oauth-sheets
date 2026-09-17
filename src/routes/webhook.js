const express = require("express");
const router = express.Router();
const sheetsService = require("../services/sheets");
const logger = require("../utils/logger");

/**
 * POST /webhook/lens
 * Receives AR Lens interaction events
 */
router.post("/lens", async (req, res) => {
  try {
    const payload = req.body;

    // Validate payload
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid payload format" },
      });
    }

    // Normalize event data
    const eventData = {
      user_id: payload.user_id || payload.snapchat_id || payload.userId,
      display_name: payload.display_name || payload.displayName,
      action: payload.action || payload.event_type || "unknown",
      lens_id: payload.lens_id || payload.lensId,
      ...payload,
    };

    logger.info("Received Lens webhook event", {
      action: eventData.action,
      lens_id: eventData.lens_id,
    });

    // Log event to Google Sheets
    await sheetsService.logLensEvent(eventData);

    res.json({
      success: true,
      message: "Event received and logged",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Webhook processing failed", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to process webhook" },
    });
  }
});

module.exports = router;
