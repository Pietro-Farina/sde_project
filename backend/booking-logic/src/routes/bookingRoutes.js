const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// router.post('/bookings', bookingController.create);
// router.get('/bookings/:id', bookingController.getById);
// router.get('/bookings', bookingController.getAll);
// router.put('/bookings/:id', bookingController.update);
// router.delete('/bookings/:id', bookingController.delete);

router.post('/reservations', bookingController.createReservation);
router.post('/reservations/active', bookingController.getActiveCourseReservationForUser);
router.post('/reservations/cancel', bookingController.cancelReservation);



module.exports = router;
