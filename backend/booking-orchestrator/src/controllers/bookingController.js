const businessServiceClient = require("../clients/businessServiceClient");
const asyncHandler = require("express-async-handler");
const dataServiceClient = require("../clients/dataServiceClient");

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

    if (!orderID || !reservationId) {
        return res.status(400).json({ message: "Missing required data" });
    }

    const capturedOrder = await paypalAdapterClient.captureOrder({ orderID });

    const { captureId, status } = capturedOrder;

    if (status === "COMPLETED") {

        // const reservation = await getReservationById(reservationId);
        const reservation = { expired: true }; // TODO: fetch reservation details

        if (reservation.expired) {
            // refund via paypal
            const refundedOrder = await paypalAdapterClient.refundOrder({
                captureId: captureId,
                reservationId
            });

            console.log("Refunded order:", refundedOrder);
        } else {
            // confirm reservation via business service
        }
    } else {

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

const getBookingsForUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const result = await dataServiceClient.getBookingsForUser(userId);

    res.status(200).json({
        data: result,
    });
});

module.exports = {
    test,
    startBookingProcess,
    getPendingReservation,
    cancelReservation,
    getBookingsForUser,
    confirmBooking,
};
