const axios = require("axios");

const DATA_SERVICE_URL =
	process.env.DATA_SERVICE_URL || "http://localhost:3002";

class DataServiceClient {
	async getAllCourses() {
		try {
			const response = await axios.get(
				`${DATA_SERVICE_URL}/api/data/courses`
			);
			return { success: true, data: response.data };
		} catch (error) {
			if (error.response && error.response.status === 404) {
				return { success: false, error: "No courses found" };
			}
			throw new Error(`Data service error: ${error.message}`);
		}
	}

	async getCourseById(id) {
		try {
			const response = await axios.get(
				`${DATA_SERVICE_URL}/api/data/courses/${id}`
			);
			return { success: true, data: response.data };
		} catch (error) {
			if (error.response && error.response.status === 404) {
				return { success: false, error: "Course not found" };
			}
			throw new Error(`Data service error: ${error.message}`);
		}
	}
}

module.exports = new DataServiceClient();
