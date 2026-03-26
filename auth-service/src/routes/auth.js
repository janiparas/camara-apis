///src/routes/auth.js
const { v4: uuidv4 } = require("uuid");
const { storeSession } = require("../services/sessionService");
const { exchangeAuthCode } = require("../services/keycloakService");
const redis = require("../lib/redis");

async function routes(fastify, options) {

  /**
   * STEP 1: Authorization request
   * Telco injects MSISDN via x-msisdn header through Kong
   */
  fastify.get("/authorize", async (request, reply) => {
  try {
    const msisdn = request.headers["x-msisdn"];

    if (!msisdn) {
      return reply.code(400).send({
        error: "missing_msisdn",
        message: "x-msisdn header is required (injected by telco via Kong)"
      });
    }

    const requestId = uuidv4();
    console.log(`[authorize] requestId=${requestId} msisdn=${msisdn}`);
    await storeSession(requestId, msisdn);

    // KEYCLOAK_PUBLIC_URL  → browser-resolvable (localhost:8080)
    // KEYCLOAK_URL         → internal Docker hostname (keycloak:8080)
    const publicBase = process.env.KEYCLOAK_PUBLIC_URL || process.env.KEYCLOAK_URL;

    const authUrl = [
      `${publicBase}/realms/${process.env.REALM}`,
      `/protocol/openid-connect/auth`,
      `?client_id=${process.env.CLIENT_ID}`,
      `&response_type=code`,
      `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`,
      `&scope=openid`,
      `&state=${requestId}`,
      `&prompt=login`
    ].join("");

    console.log(`[authorize] redirecting browser to: ${authUrl}`);
    return reply.redirect(authUrl);

  } catch (err) {
    console.error("[authorize] error:", err.message);
    return reply.code(500).send({ error: "internal_error", message: err.message });
  }
});

  /**
   * STEP 2: Token exchange (direct backend flow)
   * Accepts msisdn in body so the token→MSISDN mapping
   * is written to Redis — required for number verification (Flow 3)
   */
  fastify.post("/token", async (request, reply) => {
    try {
      const { code, redirect_uri, msisdn } = request.body;

      if (!code) {
        return reply.code(400).send({
          error: "missing_code",
          message: "code is required"
        });
      }

      const resolvedRedirectUri = redirect_uri || process.env.REDIRECT_URI;

      const tokenData = await exchangeAuthCode(code, resolvedRedirectUri);

      // Write token → MSISDN mapping so Flow 3 (number verification) works
      // for tokens issued via this direct /token route
      if (msisdn && tokenData.access_token) {
        await redis.set(
          `token:${tokenData.access_token}`,
          JSON.stringify({
            msisdn,
            createdAt: new Date().toISOString()
          }),
          "EX",
          tokenData.expires_in || 300
        );
        console.log(`[token] mapped access_token to msisdn=${msisdn}`);
      } else {
        console.warn("[token] msisdn not provided — token→MSISDN mapping skipped");
      }

      return reply.send(tokenData);

    } catch (err) {
      console.error("[token] error:", err.response?.data || err.message);
      return reply.code(500).send({
        error: "token_exchange_failed",
        message: err.response?.data || err.message
      });
    }
  });
}

module.exports = routes;