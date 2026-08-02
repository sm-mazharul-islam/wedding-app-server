const express = require("express");
const cartController = require("./cart.controller");

const router = express.Router();

router.post("/cart", cartController.saveOrUpdateCart);
router.get("/cart/:email", cartController.getUserCart);

module.exports = router;
