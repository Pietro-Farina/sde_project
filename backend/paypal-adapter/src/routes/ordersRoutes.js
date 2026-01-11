const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/ordersController");

// CREATE
router.post("/create", ordersController.createOrder);

// CAPTURE
router.post("/capture", ordersController.captureOrder);

// REFUND
router.post("/refund", ordersController.refundOrder);

// WEBHOOKS???

module.exports = router;
