const express = require("express");
const orderController = require("./order.controller");

const router = express.Router();

router.post("/orders", orderController.createOrder);

module.exports = router;
