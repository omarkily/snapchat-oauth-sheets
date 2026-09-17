const config = require("./config");
const app = require("./app");
const logger = require("./utils/logger");

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Login: http://localhost:${PORT}/snapchat/login`);
});
