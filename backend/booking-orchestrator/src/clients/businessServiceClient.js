const axios = require("axios");
const { normalizeAxiosError } = require("../utils/normalizeAxiosError");

const BUSINESS_SERVICE_URL = process.env.BUSINESS_SERVICE_URL || "http://localhost:3001";

class BusinessServiceClient {
	async createPendingReservation(reservationData) {
		try {
			const response = await axios.post(
				`${BUSINESS_SERVICE_URL}/api/v1/reservations`,
				reservationData
			);
			return response.data.data;
		} catch (error) {
			throw normalizeAxiosError(error, "BUSINESS_SERVICE");
		}
	}

	async cancelPendingReservation(id, userId) {
		try {
			const response = await axios.patch(
				`${BUSINESS_SERVICE_URL}/api/v1/reservations/${id}/cancel`,
				{ userId }
			);
			return response.data.data;
		} catch (error) {
			throw normalizeAxiosError(error, "BUSINESS_SERVICE");
		}
	}

	async getPendingReservation(reservationData) {
		try {
			console.log("Fetching pending reservation with data:", reservationData);
			const response = await axios.get(
				`${BUSINESS_SERVICE_URL}/api/v1/reservations/active`,
				{ params: reservationData }
			);
			return response.data.data;
		} catch (error) {
			throw normalizeAxiosError(error, "BUSINESS_SERVICE");
		}
	}

	async getUserReservationById(id, userId) {
		try {
			const response = await axios.get(
				`${BUSINESS_SERVICE_URL}/api/v1/reservations/${id}/price`,
				{ params: { userId } }
			);
			return response.data.data;
		} catch (error) {
			throw normalizeAxiosError(error, "BUSINESS_SERVICE");
		}
	}

	async getAllBookings() {
		try {
			const response = await axios.get(
				`${BUSINESS_SERVICE_URL}/api/v1/bookings`
			);
			return response.data.data;
		} catch (error) {
			throw normalizeAxiosError(error, "BUSINESS_SERVICE");
		}
	}

	async getUserBookings(userId) {
		try {
			const response = await axios.get(
				`${BUSINESS_SERVICE_URL}/api/v1/bookings?userId=${userId}`
			);
			return response.data.data;
		} catch (error) {
			throw normalizeAxiosError(error, "BUSINESS_SERVICE");
		}
	}

	async createBooking(bookingData) {
		try {
			const response = await axios.post(
				`${BUSINESS_SERVICE_URL}/api/v1/bookings`,
				bookingData
			);
			return response.data.data;
		} catch (error) {
			throw normalizeAxiosError(error, "BUSINESS_SERVICE");
		}
	}
}

module.exports = new BusinessServiceClient();
