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
		if (error?.status && error?.body) {
			return res.status(error.status).json(error.body);
		}

		// unexpected bug
		return res.status(500).json({
			error: {
				code: "INTERNAL_ERROR",
				message: "Unexpected server error"
			}
		});
	}
});

const getCourseById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({
			error: {
				code: "MISSING_COURSE_ID",
				message: "Course ID is required"
			}
		});
	}

	try {
		const { course } = await dataServiceClient.getCourseById(id);

		res.status(200).json({ data: { course } });
	} catch (error) {
		if (error?.status && error?.body) {
			return res.status(error.status).json(error.body);
		}

		// unexpected bug
		return res.status(500).json({
			error: {
				code: "INTERNAL_ERROR",
				message: "Unexpected server error"
			}
		});
	}
});

module.exports = {
	test,
	getAllCourses,
	getCourseById,
};
