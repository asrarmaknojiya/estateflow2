const express = require("express");
const router = express.Router();

const inventoryEntries = require(
  "../../controller/inventory/inventoryEntries"
);

const upload = require("../../middleware/fileHandler");

// 🌊 routes
router.get(
  "/getinventoryentries",
  inventoryEntries.getInventoryEntries
);

router.get(
  "/getinventoryentries/:id",
  inventoryEntries.getInventoryEntryById
);

router.post(
  "/addinventoryentry",
  upload.single("bill_img"),
  inventoryEntries.addInventoryEntry
);

router.put(
  "/updateinventoryentry/:id",
  upload.single("bill_img"),
  inventoryEntries.updateInventoryEntry
);

router.delete(
  "/deleteinventoryentry/:id",
  inventoryEntries.deleteInventoryEntry
);

module.exports = router;
