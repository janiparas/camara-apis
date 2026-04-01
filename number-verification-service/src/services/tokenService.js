const jwt = require("jsonwebtoken");

async function validateToken(token) {
  try {
    const decoded = jwt.decode(token);

    if (!decoded) {
      return { active: false };
    }

    return {
      active: true,
      ...decoded
    };
  } catch (err) {
    console.error("❌ Token decode failed:", err.message);
    return { active: false };
  }
}

module.exports = { validateToken };