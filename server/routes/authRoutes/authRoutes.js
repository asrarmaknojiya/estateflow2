const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit"); 

const {
  login,
  refreshAccessToken,
  logout,
  me,
} = require("../../controller/authController/authController");
const verifyToken = require("../../middleware/verifyToken");


const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,                   // 10 min me max 5 login attempts per IP
  message: {
    error: "Too many login attempts. Please try again after some time.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});




router.post("/login", loginLimiter, login);

router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", verifyToken, me);

module.exports = router;
