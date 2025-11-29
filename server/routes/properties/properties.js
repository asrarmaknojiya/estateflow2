// server/routes/properties.js
const express = require("express");
const router = express.Router();
const properties = require("../../controller/properties/properties"); // adjust path if necessary
const upload = require("../../middleware/fileHandler");


router.get("/getproperties", properties.getProperties);
router.get("/getproperties/:id", properties.getPropertyById);
router.post("/addproperty", upload.single("image"), properties.addProperty);
router.put("/updateproperty/:id", upload.single("image"), properties.updateProperty);
router.delete("/deleteproperty/:id", properties.deleteProperty);

module.exports = router;
