// /auth-service/src/app.js
require("dotenv").config();

const fastify = require("fastify")({ logger: true });

const authRoutes = require("./routes/auth");
const callbackRoutes = require("./routes/callback");

const { PORT } = require("./config");

fastify.register(authRoutes);
fastify.register(callbackRoutes);

fastify.get("/health", async (req, reply) => {
  return { status: "ok" };
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Auth service running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();