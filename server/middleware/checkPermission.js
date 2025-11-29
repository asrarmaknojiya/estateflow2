// middleware/checkPermission.js
const connection = require("../connection/connection");

const checkPermission = (permissionName) => {
  return (req, res, next) => {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const sql = `
      SELECT p.name
      FROM users_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = ?
    `;

    connection.query(sql, [userId], (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });

      const permissions = rows.map(r => r.name);

      if (!permissions.includes(permissionName)) {
        return res.status(403).json({ error: "Permission denied: " + permissionName });
      }

      next();
    });
  };
};

module.exports = checkPermission;
