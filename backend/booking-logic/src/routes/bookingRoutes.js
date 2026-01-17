const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { withHttpErrorHandling } = require("../utils/withHttpErrorHandling.js");

router.get('/bookings', withHttpErrorHandling(bookingController.getBookings));
router.post('/bookings', withHttpErrorHandling(bookingController.createBooking));

router.post('/reservations', withHttpErrorHandling(bookingController.createReservation));
router.get('/reservations/active', withHttpErrorHandling(bookingController.getActiveCourseReservationForUser));
router.patch('/reservations/:id/cancel', withHttpErrorHandling(bookingController.cancelReservation));

module.exports = router;
