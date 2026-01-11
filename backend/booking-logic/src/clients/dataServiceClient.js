const axios = require("axios");

const DATA_SERVICE_URL =
    process.env.DATA_SERVICE_URL || "http://localhost:3002";

class DataServiceClient {
    async getAllBookings() {
        try {
            const response = await axios.get(`${DATA_SERVICE_URL}/api/data/bookings`);
            return response.data;
        } catch (error) {
            throw new Error(`Data service error: ${error.message}`);
        }
    }

    async createReservationIfAvailable(reservationData) {
        try {
            const response = await axios.post(`${DATA_SERVICE_URL}/api/data/reservations/`, reservationData);
            return response.data.data;
        } catch (error) {
            throw new Error(`Data service error: ${error.message}`);
        }
    }

    async getReservationById(reservationId) {
        try {
            const response = await axios.get(`${DATA_SERVICE_URL}/api/data/reservations/${reservationId}`);
            return response.data.data;
        } catch (error) {
            throw new Error(`Data service error: ${error.message}`);
        }
    }

    async safeCancelReservationById(reservationId) {
        try {
            const response = await axios.patch(`${DATA_SERVICE_URL}/api/data/reservations/${reservationId}/cancel`);
            return response.data.data;
        } catch (error) {
            throw new Error(`Data service error: ${error.message}`);
        }
    }

    async getCourseReservationsByUserId({ userId, courseId }) {
        try {
            const response = await axios.get(`${DATA_SERVICE_URL}/api/data/reservations?userId=${userId}&courseId=${courseId}`);
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

    async getUserBookings(userId) {
        try {
            const response = await axios.get(
                `${DATA_SERVICE_URL}/api/data/bookings/user/${userId}`
            );
            return response.data.data;
        } catch (error) {
            throw new Error(`Data service error: ${error.message}`);
        }
    }

    async createBooking(bookingData) {
        try {
            const response = await axios.post(
                `${DATA_SERVICE_URL}/api/data/bookings`,
                bookingData
            );
            return response.data.data;
        } catch (error) {
            throw new Error(`Data service error: ${error.message}`);
        }
    }
}

module.exports = new DataServiceClient();
