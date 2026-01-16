const asyncHandler = require("express-async-handler");
const Course = require("../models/Course");
const mongoose = require("mongoose");

const getAllCourses = asyncHandler(async (req, res) => {
	const courses = await Course.find().lean();

	return res.status(200).json({
		data: {
			courses
		}
	});
});

const getCourseById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({
			error: {
				code: "MISSING_COURSE_ID",
				message: "Course ID is required."
			}
		});
	}
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({
			error: {
				code: "INVALID_COURSE_ID",
				message: "The course ID provided is not valid."
			}
		});
	}

	const course = await Course.findById(id).lean();

	if (!course) {
		return res.status(404).json({
			error: {
				code: "COURSE_NOT_FOUND",
				message: "The specified course does not exist."
			}
		});
	}

	return res.status(200).json({
		data: {
			course
		}
	});
});

module.exports = {
	getAllCourses,
	getCourseById,
};
