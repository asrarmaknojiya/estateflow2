const express = require("express");
const router = express.Router();

const sellProperties = require("../../controller/sellProperties/sellProperties");

// 🌊 routes
router.get("/getsellproperties", sellProperties.getSellProperties);
router.get("/getsellproperties/:id", sellProperties.getSellPropertyById);
router.post("/addsellproperty", sellProperties.addSellProperty);
router.put("/updatesellproperty/:id", sellProperties.updateSellProperty);
router.delete("/deletesellproperty/:id", sellProperties.deleteSellProperty);

module.exports = router;
