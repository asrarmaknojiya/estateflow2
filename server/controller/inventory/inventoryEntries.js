const connection = require("../../connection/connection");

/* 🌊 GET ALL INVENTORY ENTRIES */
const getInventoryEntries = (req, res) => {
  const q = `
    SELECT *
    FROM inventory_entries
    ORDER BY created_at DESC
  `;

  connection.query(q, (err, data) => {
    if (err)
      return res.status(500).json({
        error: "database error",
        details: err,
      });

    return res.status(200).json(data);
  });
};

/* 🌙 GET INVENTORY ENTRY BY ID */
const getInventoryEntryById = (req, res) => {
  const { id } = req.params;

  const q = `SELECT * FROM inventory_entries WHERE id = ?`;

  connection.query(q, [id], (err, data) => {
    if (err)
      return res.status(500).json({
        error: "database error",
        details: err,
      });

    if (!data.length)
      return res.status(404).json({ error: "not found" });

    return res.status(200).json(data[0]);
  });
};

/* 🌱 ADD INVENTORY ENTRY */
const addInventoryEntry = (req, res) => {
  const {
    added_by,
    item_name,
    description,
    amount,
    payment_method,
    status,
    created_at, 
  } = req.body;

  if (!added_by || !item_name || !amount) {
    return res.status(400).json({
      error: "required fields missing",
    });
  }

  const billImg = req.file ? req.file.filename : null;

  const q = `
    INSERT INTO inventory_entries
      (
        added_by,
        item_name,
        description,
        amount,
        bill_img,
        payment_method,
        status,
        created_at
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    q,
    [
      added_by,
      item_name,
      description || null,
      amount,
      billImg,
      payment_method || "cash",
      status || "pending",
      created_at || new Date(),
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({
          error: "database error",
          details: err,
        });

      return res.status(201).json({
        message: "inventory entry created",
        insertId: result.insertId,
      });
    }
  );
};

/* ✨ UPDATE INVENTORY ENTRY */
const updateInventoryEntry = (req, res) => {
  const { id } = req.params;
  const {
    item_name,
    description,
    amount,
    payment_method,
    status,
    created_at, // 👈 editable if needed
  } = req.body;

  const billImg = req.file ? req.file.filename : null;

  const q = `
    UPDATE inventory_entries SET
      item_name = COALESCE(?, item_name),
      description = COALESCE(?, description),
      amount = COALESCE(?, amount),
      bill_img = COALESCE(?, bill_img),
      payment_method = COALESCE(?, payment_method),
      status = COALESCE(?, status),
      created_at = COALESCE(?, created_at),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  connection.query(
    q,
    [
      item_name,
      description,
      amount,
      billImg,
      payment_method,
      status,
      created_at,
      id,
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({
          error: "database error",
          details: err,
        });

      if (!result.affectedRows)
        return res.status(404).json({ error: "not found" });

      return res.status(200).json({ message: "updated" });
    }
  );
};

/* 🗑️ DELETE INVENTORY ENTRY */
const deleteInventoryEntry = (req, res) => {
  const { id } = req.params;

  const q = `DELETE FROM inventory_entries WHERE id = ?`;

  connection.query(q, [id], (err, result) => {
    if (err)
      return res.status(500).json({
        error: "database error",
        details: err,
      });

    if (!result.affectedRows)
      return res.status(404).json({ error: "not found" });

    return res.status(200).json({ message: "deleted" });
  });
};

module.exports = {
  getInventoryEntries,
  getInventoryEntryById,
  addInventoryEntry,
  updateInventoryEntry,
  deleteInventoryEntry,
};
