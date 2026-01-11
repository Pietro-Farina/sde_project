const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookingsController");

router.post("/", bookingsController.createBookingWithTransaction);

router.get("/user/:userId", bookingsController.getUserBookings);

module.exports = router;