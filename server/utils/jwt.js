// utils/jwt.js
const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.ACCESS_SECRET || "ACCESS_SECRET_EXAMPLE";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "REFRESH_SECRET_EXAMPLE";

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles, // ARRAY
    },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles, // ARRAY
    },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  ACCESS_SECRET,
  REFRESH_SECRET,
};
