const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/courseController');

router.get('/', bookingController.getAllCourses);
router.get('/:id', bookingController.getCourseById);

module.exports = router;
