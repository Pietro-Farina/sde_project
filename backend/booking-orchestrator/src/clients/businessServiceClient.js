const axios = require("axios");

const BUSINESS_SERVICE_URL = process.env.BUSINESS_SERVICE_URL || "http://localhost:3001";

class BusinessServiceClient {
	async getAllBookings() {
		try {
			const response = await axios.get(
				`${BUSINESS_SERVICE_URL}/api/business/bookings`
			);
			return response.data.data;
		} catch (error) {
			throw new Error(`Business service error: ${error.message}`);
		}
	}

	async createPendingReservation(reservationData) {
		try {
			const response = await axios.post(
				`${BUSINESS_SERVICE_URL}/api/business/reservations`,
				reservationData
			);
			return response.data.data;
		} catch (error) {
			throw new Error(`Business service error: ${error.message}`);
		}
	}

	async cancelPendingReservation(reservationData) {
		try {
			const response = await axios.post(
				`${BUSINESS_SERVICE_URL}/api/business/reservations/cancel`,
				reservationData
			);
			return response.data.data;
		} catch (error) {
			throw new Error(`Business service error: ${error.message}`);
		}
	}

	async getPendingReservation(reservationData) {
		try {
			console.log("Fetching pending reservation with data:", reservationData);
			const response = await axios.post(
				`${BUSINESS_SERVICE_URL}/api/business/reservations/active`,
				reservationData
			);
			return response.data.data;
		} catch (error) {
			throw new Error(`Business service error: ${error.message}`);
		}
	}

	async getUserBookings(userId) {
		try {
			const response = await axios.get(
				`${BUSINESS_SERVICE_URL}/api/business/bookings/user/${userId}`
			);
			return response.data.data;
		} catch (error) {
			throw new Error(`Business service error: ${error.message}`);
		}
	}

	async createBooking(bookingData) {
		try {
			const response = await axios.post(
				`${BUSINESS_SERVICE_URL}/api/business/bookings`,
				bookingData
			);
			return response.data.data;
		} catch (error) {
			throw new Error(`Business service error: ${error.message}`);
		}
	}
}

module.exports = new BusinessServiceClient();
