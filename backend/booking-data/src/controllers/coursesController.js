const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
var mongoose = require('mongoose');

const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find().lean();

    if (!courses?.length) {
        return res.status(404).json({ message: 'No courses found' });
    }

    res.json(courses);
});

const getCourseById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Course ID is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Course ID' });
    }

    const course = await Course.findById(id).lean();

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
});

module.exports = {
    getAllCourses,
    getCourseById,
};