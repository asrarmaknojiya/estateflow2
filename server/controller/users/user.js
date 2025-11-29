const connection = require("../../connection/connection");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// -------------------- GET ALL USERS --------------------
const getUsers = (req, res) => {
  const q = "SELECT * FROM users ";

  connection.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    return res.status(200).json(data);
  });
};

// -------------------- GET USER BY ID --------------------
const getUserById = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM users WHERE id = ?";

  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (!data.length) return res.status(404).json({ error: "not found" });

    return res.status(200).json(data[0]);
  });
};

// -------------------- ADD USER --------------------
const addUser = (req, res) => {
  const { name, email, number, alt_number, password, status, address } =
    req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  const img = req.file ? req.file.filename : null;

  bcrypt.hash(password, SALT_ROUNDS, (hashErr, hashedPassword) => {
    if (hashErr) return res.status(500).json({ error: "hash error" });

    const q = `
      INSERT INTO users 
      (name, email, number, alt_number, password, img, status, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      name || null,
      email,
      number || null,
      alt_number || null,
      hashedPassword,
      img || null,
      status || "active",
      address || null,
    ];

    connection.query(q, params, (err, result) => {
      if (err) return res.status(500).json({ error: "database error" });

      return res.status(201).json({
        message: "created",
        insertId: result.insertId,
      });
    });
  });
};

// -------------------- UPDATE USER --------------------
const updateUser = (req, res) => {
  const loggedInUserId = req.user.id;
  const loggedInUserRole = req.user.roles; // array e.g ["admin"] or ["buyer"]
  const isAdmin = loggedInUserRole.includes("admin");

  const { id } = req.params;

  // ❌ Non-admin cannot update others
  if (!isAdmin && Number(id) !== Number(loggedInUserId)) {
    return res.status(403).json({
      error: "You can only update your own profile",
    });
  }

  // ❌ Non-admin cannot modify ROLE fields
  if (req.body.role_id || req.body.roles || req.body.role) {
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only admin can change roles",
      });
    }
  }

  const { name, email, number, alt_number, password, status, address } =
    req.body;

  const img = req.file ? req.file.filename : null;

  // If password provided → hash first
  if (password && password.trim() !== "") {
    bcrypt.hash(password, SALT_ROUNDS, (hashErr, hashedPassword) => {
      if (hashErr) return res.status(500).json({ error: "hash error" });

      const q = `
        UPDATE users SET 
          name=?, email=?, number=?, alt_number=?, 
          password=?, status=?, address=?, img=?
        WHERE id=?
      `;

      const params = [
        name || null,
        email || null,
        number || null,
        alt_number || null,
        hashedPassword,
        status || null,
        address || null,
        img || null,
        id,
      ];

      connection.query(q, params, (err, result) => {
        if (err) return res.status(500).json({ error: "database error" });

        return res.status(200).json({ message: "updated" });
      });
    });

    return;
  }

  // Password not provided → update normally
  const q = `
    UPDATE users SET 
      name=?, email=?, number=?, alt_number=?, 
      status=?, address=?, img=?
    WHERE id=?
  `;

  const params = [
    name || null,
    email || null,
    number || null,
    alt_number || null,
    status || null,
    address || null,
    img || null,
    id,
  ];

  connection.query(q, params, (err, result) => {
    if (err) return res.status(500).json({ error: "database error" });

    return res.status(200).json({ message: "updated" });
  });
};

// -------------------- DELETE USER --------------------
const deleteUser = (req, res) => {
  const { id } = req.params;

  // Remove role assignment first
  connection.query("DELETE FROM users_roles WHERE user_id=?", [id], () => {
    connection.query("DELETE FROM users WHERE id=?", [id], (err, result) => {
      if (err) return res.status(500).json({ error: "database error" });

      return res.status(200).json({
        message: "user deleted + role mappings removed",
      });
    });
  });
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
};
