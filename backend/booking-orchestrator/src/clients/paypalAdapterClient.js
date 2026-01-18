const axios = require("axios");
const { normalizeAxiosError } = require("../utils/normalizeAxiosError");

const PAYPAL_ADAPTER_SERVICE_URL = process.env.PAYPAL_ADAPTER_SERVICE_URL || "http://localhost:3003";

class PaypalAdapterClient {
    async createOrder(orderData) {
        try {
            const response = await axios.post(
                `${PAYPAL_ADAPTER_SERVICE_URL}/api/v1/orders/create`,
                orderData
            );
            return response.data.data;
        } catch (error) {
            throw normalizeAxiosError(error, "PAYPAL_ADAPTER");
        }
    }

    async captureOrder(captureData) {
        try {
            const response = await axios.post(
                `${PAYPAL_ADAPTER_SERVICE_URL}/api/v1/orders/capture`,
                captureData
            );
            return response.data.data;
        } catch (error) {
            throw normalizeAxiosError(error, "PAYPAL_ADAPTER");
        }
    }

    async refundOrder(refundData) {
        try {
            const response = await axios.post(
                `${PAYPAL_ADAPTER_SERVICE_URL}/api/v1/orders/refund`,
                refundData
            );
            return response.data.data;
        } catch (error) {
            throw normalizeAxiosError(error, "PAYPAL_ADAPTER");
        }
    }
}

module.exports = new PaypalAdapterClient();