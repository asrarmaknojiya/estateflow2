const connection = require("../../connection/connection");

/* 🌊 GET ALL BROKER ASSIGNMENTS */
const getBrokerAssignments = (req, res) => {
  const q = `
    SELECT *
    FROM broker_assignments
    WHERE trash = '0'
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

/* 🌙 GET BROKER ASSIGNMENT BY ID */
const getBrokerAssignmentById = (req, res) => {
  const { id } = req.params;

  const q = `
    SELECT *
    FROM broker_assignments
    WHERE id = ? AND trash = '0'
  `;

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

/*  ADD BROKER ASSIGNMENT */
const addBrokerAssignment = (req, res) => {
  const {
    broker_id,
    property_id,
    assigned_by,
    deal_price,
    commission_type,
    commission_value,
    created_at, // 👈 from calendar
  } = req.body;

  if (!assigned_by) {
    return res.status(400).json({
      error: "assigned_by is required",
    });
  }

  let totalCommission = null;

  if (deal_price && commission_value) {
    totalCommission =
      commission_type === "percent"
        ? (deal_price * commission_value) / 100
        : commission_value;
  }

  const q = `
    INSERT INTO broker_assignments
      (
        broker_id,
        property_id,
        assigned_by,
        deal_price,
        commission_type,
        commission_value,
        total_commission_amount,
        created_at
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    q,
    [
      broker_id || null,
      property_id || null,
      assigned_by,
      deal_price || null,
      commission_type || "percent",
      commission_value || null,
      totalCommission,
      created_at || new Date(), // 🌙 fallback
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({
          error: "database error",
          details: err,
        });

      return res.status(201).json({
        message: "broker assignment created",
        insertId: result.insertId,
      });
    }
  );
};


/*  UPDATE BROKER ASSIGNMENT */
const updateBrokerAssignment = (req, res) => {
  const { id } = req.params;
  const {
    broker_id,
    property_id,
    deal_price,
    commission_type,
    commission_value,
    created_at, // 👈 editable if needed
  } = req.body;

  let totalCommission = null;

  if (deal_price && commission_value) {
    totalCommission =
      commission_type === "percent"
        ? (deal_price * commission_value) / 100
        : commission_value;
  }

  const q = `
    UPDATE broker_assignments SET
      broker_id = COALESCE(?, broker_id),
      property_id = COALESCE(?, property_id),
      deal_price = COALESCE(?, deal_price),
      commission_type = COALESCE(?, commission_type),
      commission_value = COALESCE(?, commission_value),
      total_commission_amount = COALESCE(?, total_commission_amount),
      created_at = COALESCE(?, created_at),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND trash = '0'
  `;

  connection.query(
    q,
    [
      broker_id,
      property_id,
      deal_price,
      commission_type,
      commission_value,
      totalCommission,
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



/*  SOFT DELETE (TRASH) */
const trashBrokerAssignment = (req, res) => {
  const { id } = req.params;

  const q = `
    UPDATE broker_assignments
    SET trash = '1', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  connection.query(q, [id], (err, result) => {
    if (err)
      return res.status(500).json({
        error: "database error",
        details: err,
      });

    if (!result.affectedRows)
      return res.status(404).json({ error: "not found" });

    return res.status(200).json({ message: "moved to trash" });
  });
};

/*  GET TRASHED DATA */
const getTrashedBrokerAssignments = (req, res) => {
  const q = `
    SELECT *
    FROM broker_assignments
    WHERE trash = '1'
    ORDER BY updated_at DESC
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

module.exports = {
  getBrokerAssignments,
  getBrokerAssignmentById,
  addBrokerAssignment,
  updateBrokerAssignment,
  trashBrokerAssignment,
  getTrashedBrokerAssignments,
};
