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
  const loggedInUserId = Number(req.user.id);
  const loggedInUserRoles = req.user.roles || ""; 
  const isAdmin = loggedInUserRoles.includes("admin");

  const targetUserId = Number(req.params.id);

  // ---- 1) PERMISSION CHECKS ----

  // Non-admin → sirf apna profile update kar sakta hai
  if (!isAdmin && targetUserId !== loggedInUserId) {
    return res.status(403).json({
      error: "You can only update your own profile",
    });
  }

  // Non-admin roles change nahi kar sakta
  if (!isAdmin && (req.body.role_id || req.body.roles || req.body.role)) {
    return res.status(403).json({
      error: "Only admin can change roles",
    });
  }

  // ---- 2) BODY SE DATA NIKAL LO ----

  const {
    name,
    email,
    number,
    alt_number,
    password,
    status,
    address,
  } = req.body;

  const img = req.file ? req.file.filename : null;
  const hasPassword = password && password.trim() !== "";

  // ---- 3) CASE A: PASSWORD BHI CHANGE HOGA ----
  if (hasPassword) {
    return bcrypt.hash(password, SALT_ROUNDS, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("HASH ERROR:", hashErr);
        return res.status(500).json({ error: "hash error" });
      }

      const q = `
        UPDATE users 
        SET 
          name       = ?,
          email      = ?,
          number     = ?,
          alt_number = ?,
          password   = ?,
          status     = ?,
          address    = ?,
          img        = COALESCE(?, img)
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
        img,               // null hua to COALESCE purana img rakhega
        targetUserId,
      ];

      connection.query(q, params, (err, result) => {
        if (err) {
          console.error("UPDATE (with password) ERROR:", err);
          return res.status(500).json({ error: "database error", details: err });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "not found" });
        }

        return res.status(200).json({ message: "updated" });
      });
    });
  }

 

  const q = `
    UPDATE users 
    SET 
      name       = ?,
      email      = ?,
      number     = ?,
      alt_number = ?,
      status     = ?,
      address    = ?,
      img        = COALESCE(?, img)
    WHERE id = ?
  `;

  const params = [
    name || null,
    email || null,
    number || null,
    alt_number || null,
    status || null,
    address || null,
    img,               // null => purana img rahega
    targetUserId,
  ];

  connection.query(q, params, (err, result) => {
    if (err) {
      console.error("UPDATE (no password) ERROR:", err);
      return res.status(500).json({ error: "database error", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not found" });
    }

    return res.status(200).json({ message: "updated" });
  });
};


const deleteUser = (req, res) => {
  const { id } = req.params;

  // pool se connection lo
  connection.getConnection((err, conn) => {
    if (err) {
      console.error("GET CONNECTION ERROR:", err);
      return res.status(500).json({ error: "connection error" });
    }

    // transaction start
    conn.beginTransaction((err) => {
      if (err) {
        conn.release();
        return res.status(500).json({ error: "transaction start error" });
      }

      const deleteUserRolesQ = "DELETE FROM users_roles WHERE user_id = ?";

      conn.query(deleteUserRolesQ, [id], (err) => {
        if (err) {
          return conn.rollback(() => {
            conn.release();
            res.status(500).json({ error: "error deleting user roles" });
          });
        }

        const deleteUserQ = "DELETE FROM users WHERE id = ?";

        conn.query(deleteUserQ, [id], (err, result) => {
          if (err) {
            return conn.rollback(() => {
              conn.release();
              res.status(500).json({ error: "error deleting user" });
            });
          }

          if (result.affectedRows === 0) {
            return conn.rollback(() => {
              conn.release();
              res.status(404).json({ error: "user not found" });
            });
          }

          // commit final changes
           conn.commit((err) => {
            if (err) {
              return conn.rollback(() => {
                conn.release();
                res.status(500).json({ error: "commit error" });
              });
            }

            conn.release();
            return res.status(200).json({
              message: "User + related roles deleted successfully",
            });
          });
        });
      });
    });
  });
};

const trashUser = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  connection.query("UPDATE users SET status =? WHERE id =? ", [status, id], (err, result) => {
    if (err) {
      return res.status(500);
    } else {
      return res.json(result)
    }
  });
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  trashUser,
  deleteUser,
};
