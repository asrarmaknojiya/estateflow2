// server/controller/properties/properties.js
const connection = require("../../connection/connection");

const getProperties = (req, res) => {
  const q = "SELECT * FROM properties ORDER BY createdAt DESC";
  connection.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    return res.status(200).json(data);
  });
};

const getPropertyById = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM properties WHERE id = ?";
  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (!data || data.length === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json(data[0]);
  });
};

const addProperty = (req, res) => {
  const { title, description, address, price, status } = req.body;
  const image = req.file ? req.file.filename : (req.body.image || null);
  const now = new Date();

  const q = `
    INSERT INTO properties
      (id, title, description, address, price, status, image, createdAt, updatedAt)
    VALUES
      (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const priceVal = typeof price !== "undefined" && price !== null ? price : 0.0;
  const statusVal = status || "available";

  connection.query(
    q,
    [title || null, description || null, address || null, priceVal, statusVal, image, now, now],
    (err, result) => {
      if (err) return res.status(500).json({ error: "database error", details: err });
      return res.status(201).json({ message: "created", insertId: result.insertId || null });
    }
  );
};

const updateProperty = (req, res) => {
  const { id } = req.params;
  const { title, description, address, price, status } = req.body;
  const image = req.file ? req.file.filename : req.body.image || null;

  const q = `
    UPDATE properties SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      address = COALESCE(?, address),
      price = COALESCE(?, price),
      status = COALESCE(?, status),
      image = COALESCE(?, image),
      updatedAt = NOW()
    WHERE id = ?
  `;

  connection.query(q, [title, description, address, price, status, image, id], (err, result) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "updated" });
  });
};

const deleteProperty = (req, res) => {
  const { id } = req.params;
  const q = "DELETE FROM properties WHERE id = ? AND status = 'available'";
  connection.query(q, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found or not available for delete" });
    return res.status(200).json({ message: "deleted" });
  });
};

module.exports = {
  getProperties,
  getPropertyById,
  addProperty,
  updateProperty,
  deleteProperty,
};
