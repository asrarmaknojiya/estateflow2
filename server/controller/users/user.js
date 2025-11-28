const connection = require("../../connection/connection");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// GET all users
const getUsers = (req, res) => {
  const q = "SELECT * FROM users";

  connection.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    return res.status(200).json(data);
  });
};

// GET single user by id
const getUserById = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM users WHERE id = ?";

  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "not found" });
    }
    return res.status(200).json(data[0]);
  });
};

// ADD new user (with bcrypt)
const addUser = (req, res) => {
  const { name, email, number, alt_number, password, status, address } =
    req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const img = req.file ? req.file.filename : null;

  bcrypt.hash(password, SALT_ROUNDS, (hashErr, hashedPassword) => {
    if (hashErr) {
      return res.status(500).json({ error: "password hash error" });
    }

    const q = `
      INSERT INTO users 
        (name, email, number, alt_number, password,img, status, address )
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
      if (err) {
        return res.status(500).json({ error: "database error", details: err });
      }
      else {
        return res.status(201).json({
          message: "created",
          insertId: result.insertId,
        });
      }
    });
  });
};

// UPDATE user (simple)
// UPDATE user (simple + safe)
const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, number, alt_number, password, status, address } =
    req.body;

  const img = req.file ? req.file.filename : null;

  // helper: check kya sirf password aaya hai
  const onlyPassword =
    password &&
    password.trim() !== "" &&
    !name &&
    !email &&
    !number &&
    !alt_number &&
    !status &&
    !address &&
    !img;

  // ----------------- CASE 1: password change (kahi bhi use ho raha) -----------------
  if (password && password.trim() !== "") {
    bcrypt.hash(password, SALT_ROUNDS, (hashErr, hashedPassword) => {
      if (hashErr) {
        return res.status(500).json({ error: "password hash error" });
      }

      // ✅ A. Sirf password update karna hai
      if (onlyPassword) {
        const q = "UPDATE users SET password = ? WHERE id = ?";
        connection.query(q, [hashedPassword, id], (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "database error", details: err });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "not found" });
          }
          return res.status(200).json({ message: "password updated" });
        });
        return;
      }

      // ✅ B. Password + baaki fields bhi aa rahe hain (frontend se)
      const q = `
        UPDATE users 
        SET name = ?, email = ?, number = ?, alt_number = ?, 
            password = ?, status = ?, address = ?, img = ?
        WHERE id = ?
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
        if (err) {
          return res
            .status(500)
            .json({ error: "database error", details: err });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "not found" });
        }
        return res.status(200).json({ message: "updated" });
      });
    });

    return; // important: yahi pe function end
  }

  // ----------------- CASE 2: password nahi bheja (normal update) -----------------
  const q = `
    UPDATE users 
    SET name = ?, email = ?, number = ?, alt_number = ?, 
        status = ?, address = ?, img = ?
    WHERE id = ?
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
    if (err) {
      return res.status(500).json({ error: "database error", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not found" });
    }
    return res.status(200).json({ message: "updated" });
  });
};
// DELETE user (hard delete, simple)
// DELETE user + remove role mappings
const deleteUser = (req, res) => {
  const { id } = req.params;

  // 1) delete from users_roles where user_id = ?
  const deleteUserRoles = "DELETE FROM users_roles WHERE user_id = ?";

  connection.query(deleteUserRoles, [id], (roleErr) => {
    if (roleErr) {
      return res.status(500).json({
        error: "database error (users_roles delete failed)",
        details: roleErr,
      });
    }

    // 2) delete user from users table
    const deleteUserQuery = "DELETE FROM users WHERE id = ?";

    connection.query(deleteUserQuery, [id], (userErr, result) => {
      if (userErr) {
        return res.status(500).json({
          error: "database error (user delete failed)",
          details: userErr,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "user not found" });
      }

      return res.status(200).json({
        message: "user deleted + role mappings removed successfully",
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
