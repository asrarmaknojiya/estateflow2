const connection = require("../../connection/connection");

// 🌊 get all sold properties
// const getSellProperties = (req, res) => {
//   const q = `
//     SELECT * 
//     FROM sell_properties 
//   `;

//   connection.query(q, (err, data) => {
//     if (err)
//       return res
//         .status(500)
//         .json({ error: "database error", details: err });

//     return res.status(200).json(data);
//   });
// };

const getSellProperties = (req, res) => {
  const q = `
    SELECT 
      sp.*, 
      p.title AS title
    FROM sell_properties sp
    LEFT JOIN properties p 
      ON sp.property_id = p.id
    ORDER BY sp.created_at DESC
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


// 🌙 get single sell record by id
const getSellPropertyById = (req, res) => {
  const { id } = req.params;

  const q = `SELECT * FROM sell_properties WHERE id = ?`;

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

// 🌱 add sell property + auto reserve property
const addSellProperty = (req, res) => {
  const {
    property_id,
    buyer_id,
    assigned_by,
    amount,
    details,
    assigned_at,
  } = req.body;

  if (!property_id || !buyer_id || !amount) {
    return res.status(400).json({ error: "required fields missing" });
  }

  // 1️⃣ get a single connection from pool
  connection.getConnection((err, conn) => {
    if (err)
      return res.status(500).json({ error: "db connection failed" });

    // 2️⃣ check property
    const checkPropertyQ = `
      SELECT status 
      FROM properties 
      WHERE id = ?
    `;

    conn.query(checkPropertyQ, [property_id], (err, rows) => {
      if (err) {
        conn.release();
        return res.status(500).json({ error: "database error" });
      }

      if (!rows.length) {
        conn.release();
        return res.status(404).json({ error: "property not found" });
      }

      if (rows[0].status === "reserved") {
        conn.release();
        return res.status(400).json({ error: "property already reserved" });
      }

      // 3️⃣ start transaction
      conn.beginTransaction((err) => {
        if (err) {
          conn.release();
          return res.status(500).json({ error: "transaction error" });
        }

        // 4️⃣ insert sell record
        const insertSellQ = `
          INSERT INTO sell_properties
          (property_id, buyer_id, assigned_by, amount, details, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        conn.query(
          insertSellQ,
          [
            property_id,
            buyer_id,
            assigned_by || null,
            amount,
            details || null,
            assigned_at || new Date(),
          ],
          (err) => {
            if (err) {
              return conn.rollback(() => {
                conn.release();
                res.status(500).json({ error: "failed to create sell record" });
              });
            }

            // 5️⃣ update property status
            const updatePropertyQ = `
              UPDATE properties 
              SET status = 'reserved' 
              WHERE id = ?
            `;

            conn.query(updatePropertyQ, [property_id], (err) => {
              if (err) {
                return conn.rollback(() => {
                  conn.release();
                  res.status(500).json({ error: "failed to update property" });
                });
              }

              // 6️⃣ commit
              conn.commit((err) => {
                if (err) {
                  return conn.rollback(() => {
                    conn.release();
                    res.status(500).json({ error: "commit failed" });
                  });
                }

                conn.release();
                res.status(201).json({
                  message: "property sold & reserved successfully",
                });
              });
            });
          }
        );
      });
    });
  });
};




// ✨ update sell property
const updateSellProperty = (req, res) => {
  const { id } = req.params;
  const { property_id, buyer_id, assigned_by, amount, details } = req.body;

  const q = `
    UPDATE sell_properties SET
      property_id = COALESCE(?, property_id),
      buyer_id = COALESCE(?, buyer_id),
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
      buyer_id,
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

// 🗑️ delete sell property
const deleteSellProperty = (req, res) => {
  const { id } = req.params;

  const q = `DELETE FROM sell_properties WHERE id = ?`;

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
  getSellProperties,
  getSellPropertyById,
  addSellProperty,
  updateSellProperty,
  deleteSellProperty,
};
