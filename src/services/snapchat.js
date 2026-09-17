const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Snapchat OAuth Service
 * Handles authentication flow with Snap Kit
 */
class SnapchatService {
  /**
   * Generate OAuth authorization URL
   * @param {string} state - CSRF protection state token
   * @returns {string} - Snapchat OAuth URL
   */
  getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      client_id: config.snapchat.clientId,
      redirect_uri: config.snapchat.redirectUri,
      response_type: "code",
      scope: config.snapchat.scopes.join(" "),
      state: state,
    });

    return `${config.snapchat.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from callback
   * @returns {Promise<Object>} - Token response
   */
  async exchangeCodeForToken(code) {
    try {
      const credentials = Buffer.from(
        `${config.snapchat.clientId}:${config.snapchat.clientSecret}`
      ).toString("base64");

      const response = await axios.post(
        config.snapchat.tokenUrl,
        new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: config.snapchat.redirectUri,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      logger.info("Successfully exchanged code for token");
      return response.data;
    } catch (error) {
      logger.error("Failed to exchange code for token", error);
      throw new Error("Token exchange failed");
    }
  }

  /**
   * Fetch user profile from Snapchat API
   * @param {string} accessToken - Valid access token
   * @returns {Promise<Object>} - User profile data
   */
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(`${config.snapchat.apiUrl}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          query: "{me{displayName externalId bitmoji{avatar}}}",
        },
      });

      const userData = response.data?.data?.me || {};
      logger.info("Successfully fetched user profile", { externalId: userData.externalId });

      return {
        snapchat_id: userData.externalId,
        display_name: userData.displayName,
        bitmoji_avatar: userData.bitmoji?.avatar,
      };
    } catch (error) {
      logger.error("Failed to fetch user profile", error);
      throw new Error("Profile fetch failed");
    }
  }
}

module.exports = new SnapchatService();
