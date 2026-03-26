// src/services/tokenService.js
const axios = require("axios");
const { KEYCLOAK_URL, REALM } = require("../config");

async function validateToken(token) {
  try {
    const res = await axios.post(
      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token/introspect`,
      new URLSearchParams({
        token: token,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    return res.data;
  } catch (err) {
    throw new Error("Token validation failed");
  }
}

module.exports = { validateToken };