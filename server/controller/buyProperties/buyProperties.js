const connection = require("../../connection/connection");

// 🌊 get all buy properties
const getBuyProperties = (req, res) => {
  const q = `
    SELECT 
      bp.*, 
      p.title AS title
    FROM buy_properties bp
    LEFT JOIN properties p 
      ON bp.property_id = p.id
    ORDER BY bp.created_at DESC
  `;

  connection.query(q, (err, data) => {
    if (err)
      return res
        .status(500)
        .json({ error: "database error", details: err });

    return res.status(200).json(data);
  });
};

// 🌙 get single buy property by id
const getBuyPropertyById = (req, res) => {
  const { id } = req.params;

  const q = `SELECT * FROM buy_properties WHERE id = ?`;

  connection.query(q, [id], (err, data) => {
    if (err)
      return res
        .status(500)
        .json({ error: "database error", details: err });

    if (!data.length)
      return res.status(404).json({ error: "not found" });

    return res.status(200).json(data[0]);
  });
};

// 🌱 add buy property
const addBuyProperty = (req, res) => {
  const { property_id, seller_id, assigned_by, amount, details } = req.body;

  if (!property_id || !seller_id || !amount) {
    return res.status(400).json({
      error: "required fields missing",
    });
  }

  const q = `
    INSERT INTO buy_properties
      (property_id, seller_id, assigned_by, amount, details)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    q,
    [
      property_id,
      seller_id,
      assigned_by || null,
      amount,
      details || null,
    ],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ error: "database error", details: err });

      return res.status(201).json({
        message: "buy property created",
        insertId: result.insertId,
      });
    }
  );
};

// ✨ update buy property
const updateBuyProperty = (req, res) => {
  const { id } = req.params;
  const { property_id, seller_id, assigned_by, amount, details } = req.body;

  const q = `
    UPDATE buy_properties SET
      property_id = COALESCE(?, property_id),
      seller_id = COALESCE(?, seller_id),
      assigned_by = COALESCE(?, assigned_by),
      amount = COALESCE(?, amount),
      details = COALESCE(?, details),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  connection.query(
    q,
    [
      property_id,
      seller_id,
      assigned_by,
      amount,
      details,
      id,
    ],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ error: "database error", details: err });

      if (!result.affectedRows)
        return res.status(404).json({ error: "not found" });

      return res.status(200).json({ message: "updated" });
    }
  );
};

// 🗑️ delete buy property
const deleteBuyProperty = (req, res) => {
  const { id } = req.params;

  const q = `DELETE FROM buy_properties WHERE id = ?`;

  connection.query(q, [id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "database error", details: err });

    if (!result.affectedRows)
      return res.status(404).json({ error: "not found" });

    return res.status(200).json({ message: "deleted" });
  });
};

module.exports = {
  getBuyProperties,
  getBuyPropertyById,
  addBuyProperty,
  updateBuyProperty,
  deleteBuyProperty,
};
