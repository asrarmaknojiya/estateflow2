const bcrypt = require("bcryptjs");
const connection = require("../../connection/connection");
const {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_SECRET,
} = require("../../utils/jwt");
const jwt = require("jsonwebtoken");

// ---------------- LOGIN ----------------
const login = (req, res) => {
  const { email, password } = req.body;

  connection.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!rows.length) return res.status(404).json({ error: "User not found" });

      const user = rows[0];

      if (!bcrypt.compareSync(password, user.password))
        return res.status(400).json({ error: "Wrong password" });

      const roleSQL = `
        SELECT r.name FROM users_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `;

      connection.query(roleSQL, [user.id], (roleErr, rRows) => {
        if (roleErr) return res.status(500).json({ error: "Role fetch error" });

        const roles = rRows.map(r => r.name);

        const userPayload = { id: user.id, email: user.email, roles };

        const accessToken = generateAccessToken(userPayload);
        const refreshToken = generateRefreshToken(userPayload);

        const insertSQL = `
          INSERT INTO active_tokens 
          (access_token, refresh_token, user_id, is_blacklisted, access_expires_at, refresh_expires_at)
          VALUES (?, ?, ?, 0, DATE_ADD(NOW(), INTERVAL 15 MINUTE), DATE_ADD(NOW(), INTERVAL 7 DAY))
        `;

        connection.query(
          insertSQL,
          [accessToken, refreshToken, user.id],
          () => {
            return res.json({
              message: "Login successful",
              accessToken,
              refreshToken,
              user: userPayload,
            });
          }
        );
      });
    }
  );
};

// ---------------- REFRESH ----------------
const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ error: "Refresh token missing" });

  const sql = `
    SELECT * FROM active_tokens
    WHERE refresh_token = ? AND is_blacklisted = 0
    LIMIT 1
  `;

  connection.query(sql, [refreshToken], (err, rows) => {
    if (!rows.length) return res.status(401).json({ error: "Invalid refresh token" });

    const row = rows[0];

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // ⭐ Fetch roles again
    const roleSQL = `
      SELECT r.name 
      FROM users_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `;

    connection.query(roleSQL, [row.user_id], (rErr, rRows) => {
      if (rErr) return res.status(500).json({ error: "Role fetch failed" });

      const roles = rRows.map(r => r.name);

      const newPayload = {
        id: row.user_id,
        email: payload.email,
        roles
      };

      const newAccess = generateAccessToken(newPayload);

      const upd = `
        UPDATE active_tokens SET 
        access_token=?, 
        access_expires_at=DATE_ADD(NOW(), INTERVAL 15 MINUTE)
        WHERE refresh_token = ?
      `;

      connection.query(upd, [newAccess, refreshToken], () => {
        return res.json({ accessToken: newAccess });
      });
    });
  });
};


// ---------------- LOGOUT ----------------
const logout = (req, res) => {
  const { refreshToken } = req.body;

  connection.query(
    "UPDATE active_tokens SET is_blacklisted = 1 WHERE refresh_token = ?",
    [refreshToken],
    () => res.json({ message: "Logged out" })
  );
};

// ---------------- ME ----------------
const me = (req, res) => {
  const id = req.user.id;

  const userSQL = `
    SELECT id, name, email FROM users WHERE id = ? LIMIT 1
  `;

  connection.query(userSQL, [id], (err, rows) => {
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const user = rows[0];

    const roleSQL = `
      SELECT r.name 
      FROM users_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `;

    connection.query(roleSQL, [id], (rErr, rRows) => {
      const roles = rRows.map(r => r.name);

      return res.json({ user, roles });
    });
  });
};

module.exports = { login, refreshAccessToken, logout, me };
