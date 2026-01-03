const express = require('express');
const router = express.Router();

const bookingsRoutes = require('./bookingsRoutes');
const coursesRoutes = require('./coursesRoutes');
const reservationsRoutes = require('./reservationsRoutes');

router.use('/bookings', bookingsRoutes);
router.use('/courses', coursesRoutes);
router.use('/reservations', reservationsRoutes);
module.exports = router;