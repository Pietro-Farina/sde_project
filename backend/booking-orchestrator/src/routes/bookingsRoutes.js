const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Booking endpoints
// router.post('/bookings', bookingController.test);
// router.get('/bookings/:id', bookingController.getById);
// router.get('/bookings', bookingController.getAll);
// router.put('/bookings/:id', bookingController.update);
// router.delete('/bookings/:id', bookingController.delete);
// router.post('/bookings/:id/confirm', bookingController.confirm);
// router.post('/bookings/:id/cancel', bookingController.cancel);

router.post('/start', bookingController.startBookingProcess);

router.post('/reservations/pending', bookingController.getPendingReservation);
router.patch('/reservations/:reservationId/cancel', bookingController.cancelReservation);

module.exports = router;
