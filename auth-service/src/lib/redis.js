const Redis = require("ioredis");

const REDIS_ENABLED = process.env.REDIS_ENABLED === "true";

/**
 * 🔌 NO-OP CLIENT (when Redis disabled)
 * Keeps app running without breaking flows
 */
const noopClient = {
  set: async () => "OK",
  get: async () => null,
  del: async () => 0,
  ping: async () => "PONG",
  on: () => noopClient,
  connect: async () => {},
  status: "noop",
};

if (!REDIS_ENABLED) {
  console.warn("⚠️ [redis] Disabled (REDIS_ENABLED=false). Using in-memory/no-op mode.");
  module.exports = noopClient;
} else {
  /**
   * ✅ REAL REDIS CLIENT
   */
  const redis = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,

    // 🔥 Stability configs
    connectTimeout: 10000,       // avoid hanging forever
    lazyConnect: true,           // don't crash if Redis not ready
    maxRetriesPerRequest: 3,

    retryStrategy(times) {
      if (times > 10) {
        console.error("❌ [redis] Max retries reached. Giving up.");
        return null;
      }
      const delay = Math.min(times * 200, 3000);
      console.warn(`⚠️ [redis] Retry ${times} in ${delay}ms`);
      return delay;
    },

    reconnectOnError(err) {
      console.error("🔁 [redis] Reconnect on error:", err.message);
      return true;
    },
  });

  /**
   * 📡 Event listeners
   */
  redis.on("connect", () => {
    console.log("✅ [redis] Connected");
  });

  redis.on("ready", () => {
    console.log("🚀 [redis] Ready to use");
  });

  redis.on("error", (err) => {
    console.error("❌ [redis] Error:", err.message);
  });

  redis.on("close", () => {
    console.warn("⚠️ [redis] Connection closed");
  });

  redis.on("reconnecting", () => {
    console.warn("🔄 [redis] Reconnecting...");
  });

  /**
   * 🔥 Force initial connection (non-blocking)
   */
  (async () => {
    try {
      await redis.connect();
    } catch (err) {
      console.error("❌ [redis] Initial connection failed:", err.message);
    }
  })();

  module.exports = redis;
}