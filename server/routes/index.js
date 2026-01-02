const express = require("express");
const router = express.Router();
const authRoutes = require('../routes/authRoutes/authRoutes');
const users = require("../routes/users/user");
const role = require("../routes/users/role");
const properties = require("../routes/properties/properties");
const buyProperties = require("../routes/buyProperties/buyProperties");
const sellProperties = require("../routes/sellProperties/sellProperties");
const broker_assignments = require("../routes/broker/broker_assignments");
const inventory_entries = require("../routes/inventory/inventoryEntries");

const { globalLimiter } = require("../middleware/rateLimiter");

router.use(globalLimiter);
router.use("/", authRoutes);
router.use("/", users);
router.use("/", role);
router.use("/", properties);
router.use("/", buyProperties);
router.use("/", sellProperties);
router.use("/", broker_assignments);
router.use("/", inventory_entries);

module.exports = router;