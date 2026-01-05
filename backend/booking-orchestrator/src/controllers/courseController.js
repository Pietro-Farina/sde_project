const dataServiceClient = require("../clients/dataServiceClient");
const asyncHandler = require("express-async-handler");

const test = asyncHandler(async (req, res) => {
	res.status(200).json({ message: "Booking Controller is working!" });
});

const getAllCourses = asyncHandler(async (req, res) => {
	try {
		const result = await dataServiceClient.getAllCourses();

		res.json({ success: true, data: result.data });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

const getCourseById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "Course ID is required" });
	}

	try {
		const result = await dataServiceClient.getCourseById(id);

		if (!result.success) {
			return res.status(404).json({ message: result.error });
		}

		res.json({ success: true, data: result.data });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

module.exports = {
	test,
    getAllCourses,
    getCourseById,
};
