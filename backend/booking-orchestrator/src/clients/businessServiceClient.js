const axios = require("axios");

const BUSINESS_SERVICE_URL = process.env.BUSINESS_SERVICE_URL || "http://localhost:3001";

class BusinessServiceClient {
	async getAllBookings() {
		try {
			const response = await axios.get(
				`${BUSINESS_SERVICE_URL}/api/business/bookings`
			);
			return response.data;
		} catch (error) {
			throw new Error(`Business service error: ${error.message}`);
		}
	}
}

module.exports = new BusinessServiceClient();
