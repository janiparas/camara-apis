// src/routes/numberVerification.js

const Redis = require("ioredis");
const { validateToken } = require("../services/tokenService");

const redis = new Redis(process.env.REDIS_URL);

async function routes(fastify, options) {

  /**
   * POST /verify
   */
  fastify.post("/verify", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.code(401).send({ error: "Missing token" });
      }

      const token = authHeader.split(" ")[1];

      // ✅ Validate token (Keycloak introspection / mock)
      const tokenData = await validateToken(token);

      if (!tokenData.active) {
        return reply.code(401).send({ error: "Invalid token" });
      }

      const { phoneNumber, hashedPhoneNumber } = request.body;

      if (!phoneNumber && !hashedPhoneNumber) {
        return reply.code(400).send({
          error: "Either phoneNumber or hashedPhoneNumber required"
        });
      }

      // 🔥 Fetch MSISDN from Redis (correct source)
      const sessionData = await redis.get(`token:${token}`);

      if (!sessionData) {
        return reply.code(401).send({
          error: "Session not found (token mapping missing)"
        });
      }

      const { msisdn } = JSON.parse(sessionData);

      let isMatch = false;

      if (phoneNumber) {
        isMatch = phoneNumber === msisdn;
      }

      // (Optional future: hashed comparison)
      if (hashedPhoneNumber) {
        const crypto = require("crypto");
        const hash = crypto
          .createHash("sha256")
          .update(msisdn)
          .digest("hex");

        isMatch = hash === hashedPhoneNumber;
      }

      return reply.send({
        devicePhoneNumberVerified: isMatch
      });

    } catch (err) {
      console.error("❌ VERIFY ERROR:", err);
      return reply.code(500).send({ error: "Internal error" });
    }
  });

  /**
   * GET /device-phone-number
   */
  fastify.get("/device-phone-number", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.code(401).send({ error: "Missing token" });
      }

      const token = authHeader.split(" ")[1];

      // ✅ Validate token
      const tokenData = await validateToken(token);

      if (!tokenData.active) {
        return reply.code(401).send({ error: "Invalid token" });
      }

      // 🔥 Fetch MSISDN from Redis
      const sessionData = await redis.get(`token:${token}`);

      if (!sessionData) {
        return reply.code(401).send({
          error: "Session not found (token mapping missing)"
        });
      }

      const { msisdn } = JSON.parse(sessionData);

      return reply.send({
        devicePhoneNumber: msisdn
      });

    } catch (err) {
      console.error("❌ DEVICE NUMBER ERROR:", err);
      return reply.code(500).send({ error: "Internal error" });
    }
  });

}

module.exports = routes;