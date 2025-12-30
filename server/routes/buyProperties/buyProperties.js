const express = require("express");
const router = express.Router();

const buyProperties = require("../../controller/buyProperties/buyProperties");

// 🌊 routes
router.get("/getbuyproperties", buyProperties.getBuyProperties);
router.get("/getbuyproperties/:id", buyProperties.getBuyPropertyById);
router.post("/addbuyproperty", buyProperties.addBuyProperty);
router.put("/updatebuyproperty/:id", buyProperties.updateBuyProperty);
router.delete("/deletebuyproperty/:id", buyProperties.deleteBuyProperty);

module.exports = router;




