const jwt = require("jsonwebtoken");
const connection = require("../connection/connection");
const { ACCESS_SECRET } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];

  if (!accessToken)
    return res.status(401).json({ error: "Access token required" });

  jwt.verify(accessToken, ACCESS_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ error: "Invalid or expired access token" });

    const sql = `
      SELECT * FROM active_tokens
      WHERE access_token=? 
      AND user_id=?
      AND ip_address=?
      AND user_agent=?
      AND is_blacklisted=0
      LIMIT 1
    `;

    connection.query(
      sql,
      [accessToken, decoded.id, ip, userAgent],
      (dbErr, rows) => {
        if (dbErr) return res.status(500).json({ error: "DB error" });
        if (!rows.length)
          return res.status(401).json({ error: "Token session invalid" });

        // Attach user
        req.user = decoded;

        next();
      }
    );
  });
};
