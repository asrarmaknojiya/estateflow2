const express = require("express");
const router = express.Router();
const { login, refreshAccessToken, logout, me } =
  require("../../controller/authController/authController");
const verifyToken = require("../../middleware/verifyToken");

router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", verifyToken, me);

module.exports = router;
