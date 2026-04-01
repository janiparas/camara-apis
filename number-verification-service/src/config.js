require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 9091,
  KEYCLOAK_URL: process.env.KEYCLOAK_URL,
  REALM: process.env.REALM,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET
};