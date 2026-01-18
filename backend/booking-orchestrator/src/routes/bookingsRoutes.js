const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require("../middleware/requireAuth");

// Booking endpoints
router.get('/', requireAuth, bookingController.getUserBookings);
router.post('/start', requireAuth, bookingController.startBookingProcess);
router.post('/confirm', requireAuth, bookingController.confirmBooking);

// Reservation endpoints
router.post('/reservations/pending', requireAuth, bookingController.getPendingReservation);
router.patch('/reservations/:reservationId/cancel', requireAuth, bookingController.cancelReservation);

module.exports = router;
