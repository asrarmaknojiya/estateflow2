// routes/users/roleRoutes.js
const express = require("express");
const router = express.Router();

const roles = require("../../controller/users/role");

/* =========================== ROLES ROUTES =========================== */

router.get("/roles", roles.getRoles);
router.get("/roles/:id", roles.getRoleById);
router.post("/roles", roles.addRole);
router.put("/roles/:id", roles.updateRole);
router.delete("/roles/:id", roles.deleteRole);

/* ======================== USER_ROLES ROUTES ======================== */

// all mappings list
router.get("/user-roles", roles.getUserRoles);

// all roles for one user
router.get("/user-roles/:userId", roles.getRolesByUserId);

// assign role to user
router.post("/user-roles", roles.addUserRole);

// delete mapping by mapping id
router.delete("/user-roles/:id", roles.deleteUserRole);

module.exports = router;
