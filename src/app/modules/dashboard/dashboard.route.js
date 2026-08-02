const express = require("express");
const dashboardController = require("./dashboard.controller");

const router = express.Router();

router.get("/dashboard-stats/:email", dashboardController.getDashboardStats);

module.exports = router;
