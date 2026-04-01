const axios = require("axios");
const { KEYCLOAK_URL, REALM, CLIENT_ID, CLIENT_SECRET } = require("../config");

const tokenEndpoint = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;

async function exchangeAuthCode(code, redirectUri) {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("code", code);
  params.append("redirect_uri", redirectUri);

  const response = await axios.post(tokenEndpoint, params);
  return response.data;
}

module.exports = {
  exchangeAuthCode,
};