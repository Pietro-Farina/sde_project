const axios = require("axios");
const { normalizeAxiosError } = require("../utils/normalizeAxiosError");

const DATA_SERVICE_URL =
    process.env.DATA_SERVICE_URL || "http://localhost:3002";

class DataServiceClient {
    // Bookings
    async getAllBookings() {
        try {
            const response = await axios.get(`${DATA_SERVICE_URL}/api/v1/bookings`);
            return response.data;
        } catch (error) {
            throw normalizeAxiosError(error, "DATA_SERVICE");
        }
    }

    async getUserBookings(userId) {
        try {
            const response = await axios.get(
                `${DATA_SERVICE_URL}/api/v1/bookings?userId=${userId}`
            );
            return response.data.data;
        } catch (error) {
            throw normalizeAxiosError(error, "DATA_SERVICE");
        }
    }

    async createBooking(bookingData) {
        try {
            const response = await axios.post(
                `${DATA_SERVICE_URL}/api/v1/bookings`,
                bookingData
            );
            return response.data.data;
        } catch (error) {
            throw normalizeAxiosError(error, "DATA_SERVICE");
        }
    }

    // Reservations
    async createReservationIfAvailable(reservationData) {
        try {
            const response = await axios.post(`${DATA_SERVICE_URL}/api/v1/reservations/`, reservationData);
            return response.data.data;
        } catch (error) {
            throw normalizeAxiosError(error, "DATA_SERVICE");
        }
    }

    async getReservationById(reservationId) {
        try {
            const response = await axios.get(`${DATA_SERVICE_URL}/api/v1/reservations/${reservationId}`);
            return response.data.data;
        } catch (error) {
            throw normalizeAxiosError(error, "DATA_SERVICE");
        }
    }

    async safeCancelReservationById(reservationId) {
        try {
            const response = await axios.patch(`${DATA_SERVICE_URL}/api/v1/reservations/${reservationId}/cancel`);
            return response.data.data;
        } catch (error) {
            throw normalizeAxiosError(error, "DATA_SERVICE");
        }
    }

    async getCourseReservationsByUserId({ userId, courseId }) {
        try {
            const response = await axios.get(`${DATA_SERVICE_URL}/api/v1/reservations?userId=${userId}&courseId=${courseId}`);
            return response.data.data;
        } catch (error) {
            throw normalizeAxiosError(error, "DATA_SERVICE");
        }
    }

    // Courses
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
}

module.exports = new DataServiceClient();
