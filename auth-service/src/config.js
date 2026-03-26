// /src/config.js
require("dotenv").config();

module.exports = {
  PORT:                process.env.PORT || 3000,
  KEYCLOAK_URL:        process.env.KEYCLOAK_URL,          // internal: http://keycloak:8080
  KEYCLOAK_PUBLIC_URL: process.env.KEYCLOAK_PUBLIC_URL    // browser:  http://localhost:8080
                       || process.env.KEYCLOAK_URL,       // fallback to internal if not set
  REALM:               process.env.REALM,
  CLIENT_ID:           process.env.CLIENT_ID,
  CLIENT_SECRET:       process.env.CLIENT_SECRET,
  REDIS_URL:           process.env.REDIS_URL || "redis://:redis@redis:6379"
};