const bcrypt = require('bcryptjs');
const connection = require('../../connection/connection');
const {
  generateAccessToken,
  generateRefreshToken,
  ACCESS_SECRET,
  REFRESH_SECRET
} = require('../../utils/jwt');
const jwt = require('jsonwebtoken');


const login = (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection?.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;

  connection.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email],
    (err, users) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!users || users.length === 0)
        return res.status(404).json({ error: 'User not found' });

      const user = users[0];

      const valid = bcrypt.compareSync(password, user.password);
      if (!valid)
        return res.status(400).json({ error: 'Invalid credentials' });

      const roleSQL = `
        SELECT r.name FROM users_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `;

      connection.query(roleSQL, [user.id], (rErr, rRows) => {
        if (rErr) return res.status(500).json({ error: 'Role fetch error' });

        const roles = rRows.map(r => r.name);

       
        const payload = { id: user.id, email: user.email, roles };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const tokenSQL = `
          INSERT INTO active_tokens
          (access_token, refresh_token, user_id, ip_address, user_agent, 
           access_expires_at, refresh_expires_at, last_activity)
          VALUES (?, ?, ?, ?, ?, 
            DATE_ADD(NOW(), INTERVAL 15 MINUTE), 
            DATE_ADD(NOW(), INTERVAL 7 DAY),
            NOW()
          )
        `;

        connection.query(
          tokenSQL,
          [accessToken, refreshToken, user.id, ip, userAgent],
          (errIns) => {
            if (errIns) {
              console.error("Token insert error", errIns);
              return res.status(500).json({ error: "Token save error" });
            }

            return res.json({
              message: "Login successful",
              accessToken,
              refreshToken,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles
              }
            });
          }
        );
      });
    }
  );
};


const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ error: "Refresh token required" });

  const q = `
    SELECT * FROM active_tokens
    WHERE refresh_token = ? 
      AND is_blacklisted = 0
    LIMIT 1
  `;

  connection.query(q, [refreshToken], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!rows || rows.length === 0)
      return res.status(401).json({ error: "Invalid refresh token" });

    const row = rows[0];

    const now = new Date();
    const last = new Date(row.last_activity);
    const diffMin = (now - last) / (1000 * 60);

    if (diffMin > 15) {
      connection.query(
        "UPDATE active_tokens SET is_blacklisted=1 WHERE id=?",
        [row.id]
      );
      return res.status(401).json({ error: "Session expired due to inactivity" });
    }

    try {
      jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      connection.query(
        "UPDATE active_tokens SET is_blacklisted=1 WHERE id=?",
        [row.id]
      );
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const payload = { id: row.user_id };
    const newAccess = generateAccessToken(payload);

    const upd = `
      UPDATE active_tokens 
      SET access_token=?, access_expires_at=DATE_ADD(NOW(), INTERVAL 15 MINUTE), last_activity=NOW()
      WHERE id=?
    `;

    connection.query(upd, [newAccess, row.id], (uErr) => {
      if (uErr) return res.status(500).json({ error: "DB error" });

      return res.json({ accessToken: newAccess });
    });
  });
};



const logout = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ error: "Refresh token missing" });

  connection.query(
    "UPDATE active_tokens SET is_blacklisted=1 WHERE refresh_token=?",
    [refreshToken],
    () => res.json({ message: "Logged out successfully" })
  );
};


const me = (req, res) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const userSQL = `
    SELECT id, name, email
    FROM users 
    WHERE id=? LIMIT 1
  `;

  connection.query(userSQL, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const user = rows[0];

    const roleSQL = `
      SELECT r.name 
      FROM users_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `;

    connection.query(roleSQL, [userId], (rErr, rRows) => {
      if (rErr) return res.status(500).json({ error: "Role fetch error" });

      const roles = rRows.map(r => r.name);

      return res.json({ user, roles });
    });
  });
};


// EXPORT
module.exports = { login, refreshAccessToken, logout, me };
