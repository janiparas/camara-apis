// src/routes/callback.js
const redis = require("../lib/redis");
const { getSession, deleteSession } = require("../services/sessionService");
const { exchangeAuthCode } = require("../services/keycloakService");

module.exports = async function (fastify, opts) {

  /**
   * OAuth callback — Keycloak redirects here after authentication
   * Exchanges auth code for JWT, binds token → MSISDN in Redis
   */
  fastify.get("/callback", async (request, reply) => {
    try {
      const { code, state, error, error_description } = request.query;

      // Handle Keycloak-side errors (e.g. user cancelled login)
      if (error) {
        console.error(`[callback] keycloak error: ${error} — ${error_description}`);
        return reply.code(400).send({
          error,
          message: error_description || "Authorization failed"
        });
      }

      if (!code || !state) {
        return reply.code(400).send({
          error: "missing_params",
          message: "code and state are required"
        });
      }

      console.log(`[callback] received code, state=${state}`);

      // Retrieve MSISDN bound to this state
      const session = await getSession(state);

      if (!session) {
        console.error(`[callback] session not found or expired for state=${state}`);
        return reply.code(400).send({
          error: "session_expired",
          message: "Session expired or invalid state — restart the auth flow"
        });
      }

      const { msisdn } = session;
      console.log(`[callback] session found, msisdn=${msisdn}`);

      // Exchange auth code for tokens via keycloakService (single source of truth)
      const tokenData = await exchangeAuthCode(code, process.env.REDIRECT_URI);

      console.log(`[callback] token exchange successful`);

      // Bind access_token → MSISDN in Redis (consumed by number verification service)
      await redis.set(
        `token:${tokenData.access_token}`,
        JSON.stringify({
          msisdn,
          createdAt: new Date().toISOString()
        }),
        "EX",
        tokenData.expires_in || 300
      );

      console.log(`[callback] token→MSISDN mapped, msisdn=${msisdn}`);

      // Clean up session — no longer needed
      await deleteSession(state);
      console.log(`[callback] session deleted, state=${state}`);

      return reply.send({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type || "Bearer",
        msisdn
      });

    } catch (err) {
      console.error("[callback] error:", err.response?.data || err.message);
      return reply.code(500).send({
        error: "callback_failed",
        message: err.response?.data || err.message
      });
    }
  });

};