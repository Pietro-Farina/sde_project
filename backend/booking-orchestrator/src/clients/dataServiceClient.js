const axios = require("axios");
const { normalizeAxiosError } = require("../utils/normalizeAxiosError");

const DATA_SERVICE_URL =
	process.env.DATA_SERVICE_URL || "http://localhost:3002";

class DataServiceClient {
	async getAllCourses() {
		try {
			const response = await axios.get(
				`${DATA_SERVICE_URL}/api/v1/courses`
			);
			return response.data.data;
		} catch (error) {
			throw normalizeAxiosError(error, "DATA_SERVICE");
		}
	}

	async getCourseById(id) {
		try {
			const response = await axios.get(
				`${DATA_SERVICE_URL}/api/v1/courses/${id}`
			);
			return response.data.data;
		} catch (error) {
			throw normalizeAxiosError(error, "DATA_SERVICE");
		}
	}

	async cancelReservationById(reservationId) {
		try {
			const response = await axios.patch(
				`${DATA_SERVICE_URL}/api/v1/reservations/${reservationId}/cancel`
			);
			return response.data.data;
		} catch (error) {
			throw normalizeAxiosError(error, "DATA_SERVICE");
		}
	}
}

module.exports = new DataServiceClient();
