const express = require('express');
const router = express.Router();

const bookingsRoutes = require('./bookingsRoutes');
const coursesRoutes = require('./coursesRoutes');
// const reservationsRoutes = require('./reservationsRoutes');
const authRoutes = require('./authRoutes');

router.use('/bookings', bookingsRoutes);
router.use('/courses', coursesRoutes);
// router.use('/reservations', reservationsRoutes);
router.use('/auth', authRoutes);

module.exports = router;