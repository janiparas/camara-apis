require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,

  KEYCLOAK_URL: process.env.KEYCLOAK_URL,
  KEYCLOAK_PUBLIC_URL:
    process.env.KEYCLOAK_PUBLIC_URL || process.env.KEYCLOAK_URL,

  REALM: process.env.REALM,   // ✅ FIXED

  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,

  REDIRECT_URI: process.env.REDIRECT_URI,
};