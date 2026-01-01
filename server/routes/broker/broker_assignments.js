const express = require("express");
const router = express.Router();

const brokerAssignments = require(
  "../../controller/broker/broker_assignments"
);

// 🌊 routes
router.get(
  "/getbrokerassignments",
  brokerAssignments.getBrokerAssignments
);

router.get(
  "/getbrokerassignments/:id",
  brokerAssignments.getBrokerAssignmentById
);

router.post(
  "/addbrokerassignment",
  brokerAssignments.addBrokerAssignment
);

router.put(
  "/updatebrokerassignment/:id",
  brokerAssignments.updateBrokerAssignment
);

router.delete(
  "/trashbrokerassignment/:id",
  brokerAssignments.trashBrokerAssignment
);

router.get(
  "/gettrashedbrokerassignments",
  brokerAssignments.getTrashedBrokerAssignments
);

module.exports = router;
