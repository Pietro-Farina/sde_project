const businessServiceClient = require("../clients/businessServiceClient");
const asyncHandler = require("express-async-handler");
const dataServiceClient = require("../clients/dataServiceClient");
const paypalAdapterClient = require("../clients/paypalAdapterClient");

const test = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Booking Controller is working!" });
});

const startBookingProcess = asyncHandler(async (req, res) => {
    // Logic to start the booking process
    const { userId, courseId, slotIds } = req.body;

    // Validate user eligibility via Oauth service

    // Create a pending reservation in booking-data service
    const result = await businessServiceClient.createPendingReservation({
        userId,
        courseId,
        slotIds,
    });

    console.log("Pending reservation created:", result);

    const { reservationId, priceToPay } = result;

    const createdOrder = await paypalAdapterClient.createOrder({
        reservationId,
        priceToPay,
    });

    // if successful, return reservation details and price to pay
    return res.status(201).json({
        data: {
            reservationId,
            priceToPay,
            orderID: createdOrder.orderID
        },
    });
});

// api paypal capture-order
const confirmBooking = asyncHandler(async (req, res) => {
    const { orderID, reservationId } = req.body;

    const userId = "648a1f4e2f8fb814c8d6f9b1"; // TODO: get from auth

    if (!orderID || !reservationId) {
        return res.status(400).json({ message: "Missing required data" });
    }

    const capturedOrder = await paypalAdapterClient.captureOrder({ orderID });

    const { captureId, status, pricePaid } = capturedOrder;

    if (status === "COMPLETED") {
        // I try to book the reservation
        const bookingResult = await businessServiceClient.createBooking({
            userId,
            reservationId,
            transactionId: orderID,
            price: pricePaid
        });

        if (!bookingResult) {
            // Booking failed, refund the user

            const refundedOrder = await paypalAdapterClient.refundOrder({
                captureId: captureId,
                reservationId
            });

            console.log("Refunded order due to booking failure:", refundedOrder);

            return res.status(500).json({ error: "Booking failed, payment refunded" });
        }
    } else {
        return res.status(400).json({ error: "Payment not completed" });
    }

    return res.status(200).json({
        data: {
            captureId,
            status
        }
    });
});

const getPendingReservation = asyncHandler(async (req, res) => {
    const { userId, courseId } = req.body;

    const result = await businessServiceClient.getPendingReservation({
        userId,
        courseId,
    });

    res.status(200).json({
        data: result,
    });
});

const cancelReservation = asyncHandler(async (req, res) => {
    const { reservationId } = req.params;

    const result = await dataServiceClient.cancelReservationById(reservationId);

    res.status(200).json({
        data: result,
    });
});

const getUserBookings = asyncHandler(async (req, res) => {
    const userId = "648a1f4e2f8fb814c8d6f9b1"; // TODO: get from auth

    const result = await businessServiceClient.getUserBookings(userId);

    res.status(200).json({
        data: result,
    });
});

module.exports = {
    test,
    startBookingProcess,
    getPendingReservation,
    cancelReservation,
    getUserBookings,
    confirmBooking,
};
