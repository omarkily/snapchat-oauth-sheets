const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health");
const snapchatRoutes = require("./routes/snapchat");
const webhookRoutes = require("./routes/webhook");
const logger = require("./utils/logger");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
  });
  next();
});

// Routes
app.use("/health", healthRoutes);
app.use("/snapchat", snapchatRoutes);
app.use("/webhook", webhookRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "Snapchat Integration Bot",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      login: "GET /snapchat/login",
      callback: "GET /snapchat/callback",
      lensWebhook: "POST /webhook/lens",
    },
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
