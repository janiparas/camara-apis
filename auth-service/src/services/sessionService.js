// src/services/sessionService.js
const redis = require("../lib/redis");

const REDIS_ENABLED = process.env.REDIS_ENABLED === "true";
const TTL    = 60;
const PREFIX = "session";

// In-memory fallback store (single instance, non-persistent)
const memoryStore = new Map();

async function storeSession(requestId, msisdn) {
  const key   = `${PREFIX}:${requestId}`;
  const value = JSON.stringify({ msisdn, createdAt: new Date().toISOString() });

  if (REDIS_ENABLED) {
    await redis.set(key, value, "EX", TTL);
  } else {
    memoryStore.set(key, value);
    // Auto-expire from memory store
    setTimeout(() => memoryStore.delete(key), TTL * 1000);
  }
  console.log(`[session] stored: ${key}`);
}

async function getSession(requestId) {
  const key = `${PREFIX}:${requestId}`;

  if (REDIS_ENABLED) {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } else {
    const data = memoryStore.get(key);
    if (!data) return null;
    return JSON.parse(data);
  }
}

async function deleteSession(requestId) {
  const key = `${PREFIX}:${requestId}`;

  if (REDIS_ENABLED) {
    await redis.del(key);
  } else {
    memoryStore.delete(key);
  }
  console.log(`[session] deleted: ${key}`);
}

module.exports = { storeSession, getSession, deleteSession };