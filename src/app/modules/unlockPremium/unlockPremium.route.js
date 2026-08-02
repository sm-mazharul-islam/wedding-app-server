const express = require("express");
const unlockPremiumController = require("./unlockPremium.controller");

const router = express.Router();

router.post("/unlock-premium", unlockPremiumController.unlockPremiumProfile);
router.get(
  "/unlocked-requests/:email",
  unlockPremiumController.getUnlockedRequestsByEmail,
);
router.get(
  "/all-unlocked-requests",
  unlockPremiumController.getAllUnlockedRequests,
);
router.delete(
  "/unlock-premium/:id",
  unlockPremiumController.deleteUnlockedRequest,
);

module.exports = router;
