const axios = require("axios");

const DATA_SERVICE_URL =
	process.env.DATA_SERVICE_URL || "http://localhost:3002";

class DataServiceClient {
	async getAllCourses() {
		try {
			const response = await axios.get(
				`${DATA_SERVICE_URL}/api/data/courses`
			);
			return response.data.data;
		} catch (error) {
			throw new Error(`Data service error: ${error.message}`);
		}
	}

	async getCourseById(id) {
		try {
			const response = await axios.get(
				`${DATA_SERVICE_URL}/api/data/courses/${id}`
			);
			return response.data.data;
		} catch (error) {
			throw new Error(`Data service error: ${error.message}`);
		}
	}
}

module.exports = new DataServiceClient();
