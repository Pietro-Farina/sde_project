const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookingsController");

router.post("/", bookingsController.createBookingWithTransaction);

router.get("/", bookingsController.getBookings);

module.exports = router;