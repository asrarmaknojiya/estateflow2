const express = require("express");
const router = express.Router();

const users = require("../../controller/users/user");
const upload = require("../../middleware/fileHandler");
const verifyToken = require("../../middleware/verifyToken");
const checkPermission = require("../../middleware/checkPermission");

// GET all users
router.get(
  "/users",
  verifyToken,
  checkPermission("read_user"),
  users.getUsers
);

// GET single user
router.get(
  "/users/:id",
  verifyToken,
  checkPermission("read_user"),
  users.getUserById
);

// ADD new user
router.post(
  "/users",
  verifyToken,
  checkPermission("create_user"),
  upload.single("img"),
  users.addUser
);

// UPDATE user
router.put(
  "/users/:id",
  verifyToken,
  checkPermission("update_user"),
  upload.single("img"),
  users.updateUser
);

// DELETE user
router.delete(
  "/users/:id",
  verifyToken,
  checkPermission("delete_user"),
  users.deleteUser
);

module.exports = router;
