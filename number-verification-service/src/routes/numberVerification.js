const Redis = require("ioredis");
const { validateToken } = require("../services/tokenService");

const redis = new Redis(process.env.REDIS_URL);

async function routes(fastify, options) {

  fastify.post("/verify", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.code(401).send({ error: "Missing token" });
      }

      const token = authHeader.split(" ")[1];
      console.log("[verify] token:", token);

      const tokenData = await validateToken(token);
      console.log("[verify] tokenData:", tokenData);

      if (!tokenData.active) {
        return reply.code(401).send({ error: "Invalid token" });
      }

      const sessionData = await redis.get(`token:${token}`);
      console.log("[verify] redis session:", sessionData);

      if (!sessionData) {
        return reply.code(401).send({
          error: "Session not found (token mapping missing)"
        });
      }

      const { msisdn } = JSON.parse(sessionData);

      const { phoneNumber } = request.body;

      const isMatch = phoneNumber === msisdn;

      return reply.send({
        devicePhoneNumberVerified: isMatch
      });

    } catch (err) {
      console.error("❌ VERIFY ERROR:", err);
      return reply.code(500).send({ error: "Internal error" });
    }
  });

  fastify.get("/device-phone-number", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.code(401).send({ error: "Missing token" });
      }

      const token = authHeader.split(" ")[1];

      const tokenData = await validateToken(token);

      if (!tokenData.active) {
        return reply.code(401).send({ error: "Invalid token" });
      }

      const sessionData = await redis.get(`token:${token}`);

      if (!sessionData) {
        return reply.code(401).send({
          error: "Session not found"
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