const dataServiceClient = require("../clients/dataServiceClient");
const asyncHandler = require("express-async-handler");

const test = asyncHandler(async (req, res) => {
	res.status(200).json({ message: "Booking Controller is working!" });
});

const getAllCourses = asyncHandler(async (req, res) => {
	try {
		const { courses } = await dataServiceClient.getAllCourses();

		res.json({ data: courses });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

const getCourseById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ error: "Course ID is required" });
	}

	try {
		const { course } = await dataServiceClient.getCourseById(id);

		res.status(200).json({ data: { course } });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = {
	test,
    getAllCourses,
    getCourseById,
};
