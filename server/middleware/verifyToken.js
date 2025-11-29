// middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const connection = require("../connection/connection");
const { ACCESS_SECRET } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ error: "Missing Authorization header" });

  const accessToken = authHeader.split(" ")[1];
  if (!accessToken)
    return res.status(401).json({ error: "Missing token" });

  jwt.verify(accessToken, ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });

    // 🔥 IMPORTANT: NO IP CHECK, NO USER-AGENT CHECK
    const sql = `
      SELECT * FROM active_tokens
      WHERE access_token = ?
      AND user_id = ?
      AND is_blacklisted = 0
      LIMIT 1
    `;

    connection.query(sql, [accessToken, decoded.id], (dbErr, rows) => {
      if (dbErr) return res.status(500).json({ error: "Database error" });

      if (!rows.length) {
        return res.status(401).json({ error: "Session expired / invalid token" });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        roles: decoded.roles,
      };

      next();
    });
  });
};
