const express = require("express");
const router = express.Router();
const authRoutes = require('../routes/authRoutes/authRoutes');
const users = require("../routes/users/user");
const role = require("../routes/users/role");
const properties = require("../routes/properties/properties");

router.use("/", authRoutes);
router.use("/", users);
router.use("/", role);
router.use("/", properties);

module.exports = router;