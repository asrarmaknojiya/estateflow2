// controller/users/role.js
const connection = require("../../connection/connection");

/* ========================= ROLES TABLE APIS ========================= */

// GET all roles
const getRoles = (req, res) => {
  const q = "SELECT * FROM roles";

  connection.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    return res.status(200).json(data);
  });
};

// GET single role by id
const getRoleById = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM roles WHERE id = ?";

  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (!data || data.length === 0)
      return res.status(404).json({ error: "not found" });
    return res.status(200).json(data[0]);
  });
};

// ADD new role
const addRole = (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "name is required" });

  const q = "INSERT INTO roles (name) VALUES (?)";

  connection.query(q, [name], (err, result) => {
    if (err)
      return res.status(500).json({ error: "database error", details: err });
    return res
      .status(201)
      .json({ message: "created", insertId: result.insertId });
  });
};

// UPDATE role
const updateRole = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const q = `
    UPDATE roles 
    SET name = COALESCE(?, name), updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  connection.query(q, [name || null, id], (err, result) => {
    if (err)
      return res.status(500).json({ error: "database error", details: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "updated" });
  });
};

// DELETE role
const deleteRole = (req, res) => {
  const { id } = req.params;
  const q = "DELETE FROM roles WHERE id = ?";

  connection.query(q, [id], (err, result) => {
    if (err)
      return res.status(500).json({
        error: "database error (maybe used in users_roles)",
        details: err,
      });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "deleted" });
  });
};

/* ======================= USER_ROLES TABLE APIS ======================= */

// GET all mappings (users_roles)
const getUserRoles = (req, res) => {
  const q = `
    SELECT 
      ur.id,
      ur.user_id,
      ur.role_id,
      ur.created_at,
      ur.updated_at,
      u.name AS user_name,
      u.email AS user_email,
      r.name AS role_name
    FROM users_roles ur
    JOIN users u ON ur.user_id = u.id
    JOIN roles r ON ur.role_id = r.id
  `;

  connection.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    return res.status(200).json(data);
  });
};

// GET all roles for a specific user
const getRolesByUserId = (req, res) => {
  const { userId } = req.params;

  const q = `
    SELECT 
      ur.id,
      ur.user_id,
      ur.role_id,
      ur.created_at,
      ur.updated_at,
      r.name AS role_name
    FROM users_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = ?
  `;

  connection.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    return res.status(200).json(data);
  });
};

// ASSIGN role to user (insert into users_roles)
const addUserRole = (req, res) => {
  const { user_id, role_id } = req.body;

  if (!user_id || !role_id) {
    return res
      .status(400)
      .json({ error: "user_id and role_id are required" });
  }

  const checkQuery =
    "SELECT id FROM users_roles WHERE user_id = ? AND role_id = ? LIMIT 1";

  connection.query(checkQuery, [user_id, role_id], (checkErr, rows) => {
    if (checkErr)
      return res
        .status(500)
        .json({ error: "database error", details: checkErr });

    if (rows && rows.length > 0) {
      return res.status(409).json({ error: "role already assigned" });
    }

    const insertQuery =
      "INSERT INTO users_roles (user_id, role_id) VALUES (?, ?)";

    connection.query(insertQuery, [user_id, role_id], (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ error: "database error", details: err });

      return res
        .status(201)
        .json({ message: "role assigned", insertId: result.insertId });
    });
  });
};

// DELETE mapping from users_roles
const deleteUserRole = (req, res) => {
  const { id } = req.params;

  const q = "DELETE FROM users_roles WHERE id = ?";

  connection.query(q, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "deleted" });
  });
};

module.exports = {
  // roles
  getRoles,
  getRoleById,
  addRole,
  updateRole,
  deleteRole,

  // user_roles
  getUserRoles,
  getRolesByUserId,
  addUserRole,
  deleteUserRole,
};
