const asyncHandler = require("express-async-handler");
const Course = require("../models/Course");
const mongoose = require("mongoose");

const course1 = {
	name: "Introduction to Web Development",
	description:
		"Learn the basics of HTML, CSS, and JavaScript to build modern web pages.",
	open: true,
	slots: [
		{
			start: new Date("2026-03-10T09:00:00.000Z"),
			end: new Date("2026-03-10T13:00:00.000Z"),
			capacity: 20,
			available: 20,
		},
		{
			start: new Date("2026-03-12T14:00:00.000Z"),
			end: new Date("2026-03-12T18:00:00.000Z"),
			capacity: 20,
			available: 15,
		},
	],
	priceOptions: [
		{
			numberSlots: 1,
			price: "49.00",
		},
		{
			numberSlots: 2,
			price: "89.00",
		},
	],
};

const course2 = {
	name: "Advanced Node.js and Backend APIs",
	description:
		"Deep dive into Node.js, Express, and REST API design with real-world patterns.",
	open: true,
	slots: [
		{
			start: new Date("2026-03-18T09:00:00.000Z"),
			end: new Date("2026-03-18T17:00:00.000Z"),
			capacity: 15,
			available: 10,
		},
		{
			start: new Date("2026-03-25T09:00:00.000Z"),
			end: new Date("2026-03-25T17:00:00.000Z"),
			capacity: 15,
			available: 15,
		},
	],
	priceOptions: [
		{
			numberSlots: 1,
			price: "99.00",
		},
		{
			numberSlots: 2,
			price: "179.00",
		},
		{
			numberSlots: 3,
			price: "249.00",
		},
	],
};

const course3 = {
	name: "DevOps Fundamentals with Docker",
	description:
		"Understand DevOps principles and learn how to containerize applications using Docker.",
	open: false,
	slots: [
		{
			start: new Date("2026-04-02T10:00:00.000Z"),
			end: new Date("2026-04-02T16:00:00.000Z"),
			capacity: 12,
			available: 0,
		},
		{
			start: new Date("2026-04-09T10:00:00.000Z"),
			end: new Date("2026-04-09T16:00:00.000Z"),
			capacity: 12,
			available: 5,
		},
	],
	priceOptions: [
		{
			numberSlots: 1,
			price: "79.00",
		},
		{
			numberSlots: 2,
			price: "139.00",
		},
	],
};

const getAllCourses = asyncHandler(async (req, res) => {
	const courses = await Course.find().lean();

	return res.status(200).json({
		data: courses
	});
});

const getCourseById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ error: "Course ID is required" });
	}
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid Course ID" });
	}

	const course = await Course.findById(id).lean();

	if (!course) {
		return res.status(404).json({ error: "Course not found" });
	}

	return res.status(200).json({
		data: course
	});
});

module.exports = {
	getAllCourses,
	getCourseById,
};
