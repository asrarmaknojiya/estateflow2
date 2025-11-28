const express = require("express");
const router = express.Router();

const users = require("../../controller/users/user");
const upload = require("../../middleware/fileHandler");
// const verifyToken = require("../../middleware/verifyToken");
// const authorizeRole = require("../../middleware/authorizeRole");

// Auth
// router.post("/auth/login", users.loginUser);

// Users CRUD
router.get("/users",  users.getUsers);
router.get(
  "/users/:id",

  users.getUserById
);

router.post(
  "/users",

  upload.single("img"),
  users.addUser
);

router.put(
  "/users/:id",

  upload.single("img"),
  users.updateUser
);

router.delete(
  "/users/:id",

  users.deleteUser
);

module.exports = router;
