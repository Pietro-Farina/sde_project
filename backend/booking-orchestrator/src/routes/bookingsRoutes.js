const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require("../middleware/requireAuth");

// Booking endpoints
// router.post('/bookings', bookingController.test);
// router.get('/bookings/:id', bookingController.getById);
// router.get('/bookings', bookingController.getAll);
// router.put('/bookings/:id', bookingController.update);
// router.delete('/bookings/:id', bookingController.delete);
// router.post('/bookings/:id/confirm', bookingController.confirm);
// router.post('/bookings/:id/cancel', bookingController.cancel);

router.get('/', requireAuth, bookingController.getUserBookings);

router.post('/start', requireAuth, bookingController.startBookingProcess);
router.post('/confirm', requireAuth, bookingController.confirmBooking);

router.post('/reservations/pending', requireAuth, bookingController.getPendingReservation);
router.patch('/reservations/:reservationId/cancel', requireAuth, bookingController.cancelReservation);

module.exports = router;
