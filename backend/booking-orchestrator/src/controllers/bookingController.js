const businessServiceClient = require("../clients/businessServiceClient");
const asyncHandler = require("express-async-handler");
const paypalAdapterClient = require("../clients/paypalAdapterClient");
const { sendError, isNormalizedDownstreamError, translateDependencyError } = require("../utils/handleError");

/**
 * If successful returns 201
 * Can throw: 400, 502, 503, 504
 * Can propagate errors from other services: 400, 404, 409
 * PROTECTED ROUTE: requires user authentication -> 401
 */
const startBookingProcess = asyncHandler(async (req, res) => {
    // Logic to start the booking process
    const { courseId, slotIds } = req.body;

    if (!courseId || !Array.isArray(slotIds) || slotIds.length === 0) {
        return sendError(res, 400, "INVALID_REQUEST", "courseId and slotIds are required."); // status(400)
    }

    // Get user ID from auth middleware
    const userId = req.user.id;

    // Create a pending reservation in booking-data service
    let reservationResult;
    try {
        // Can throw: 400, 404, 409, 5xx
        reservationResult = await businessServiceClient.createPendingReservation({
            userId,
            courseId,
            slotIds,
        });
    } catch (error) {
        // if 4xx I propagate
        // if 5xx I translate to service unavailable
        if (isNormalizedDownstreamError(error)) {
            const status = error.status;
            if (status >= 400 && status < 500) {
                return res.status(error.status).json(error.body); // propagate as-is
            }
        }
        return translateDependencyError(res, error, "RESERVATION_CREATION_FAILED");
    }

    console.log("Pending reservation created:", reservationResult);

    const { reservationId, priceToPay } = reservationResult;

    let createdOrder;
    try {
        // Can throw: 400, 5xx
        createdOrder = await paypalAdapterClient.createOrder({
            reservationId,
            priceToPay,
        });
    } catch (error) {
        return translateDependencyError(res, error, "PAYMENT_ORDER_FAILED");
    }

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
/**
 * If successful returns 201
 * Can throw: 400, 409, 502, 503, 504
 * Errors from other services are translated based on the progress of the request
 * PROTECTED ROUTE: requires user authentication -> 401
 */
const confirmBooking = asyncHandler(async (req, res) => {
    const { orderID, reservationId } = req.body;

    // Get user ID from auth middleware
    const userId = req.user.id;

    if (!orderID || !reservationId) {
        return sendError(res, 400, "INVALID_REQUEST", "orderID and reservationId are required."); // status(400)
    }

    let capturedOrder;
    try {
        // Can throw: 400, 5xx
        capturedOrder = await paypalAdapterClient.captureOrder({ orderID });
    } catch (error) {
        return translateDependencyError(res, error, "PAYMENT_CAPTURE_FAILED");
    }

    const { captureId, status, pricePaid } = capturedOrder;

    if (status !== "COMPLETED") {
        return sendError(res, 400, "PAYMENT_NOT_COMPLETED", "Payment was not completed successfully."); // status(400)
    }

    try {
        // If bookings is successful, I confirm the booking
        // Can throw: 400, 403, 404, 409, 5xx
        const bookingResult = await businessServiceClient.createBooking({
            userId,
            reservationId,
            transactionId: orderID,
            price: pricePaid
        });

        return res.status(201).json({
            data: {
                booking: bookingResult
            }
        });
    } catch (error) {
        // Booking failed AFTER capture -> attempt refund (compensation)
        try {
            // Can throw: 400, 5xx
            await paypalAdapterClient.refundOrder({
                captureId: captureId,
                reservationId
            });
        } catch (refundError) {
            // status(502)
            return sendError(res, 502, "BOOKING_FAILED_REFUND_FAILED", "Booking failed and refund could not be completed.");
        }

        // If we reached here, refund succeeded.
        // status(409)
        return sendError(res, 409, "BOOKING_FAILED_PAYMENT_REFUNDED", "Booking failed but payment was refunded.");
    }
});

/**
 * If successful returns 200
 * Can throw: 400, 502, 503, 504
 * Can propagate errors from other services: 400, 404
 * PROTECTED ROUTE: requires user authentication -> 401
 */
const getPendingReservation = asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    // Get user ID from auth middleware
    const userId = req.user.id;

    if (!courseId) {
        return sendError(res, 400, "INVALID_REQUEST", "courseId is required.");
    }

    try {
        // Can throw: 400, 404, 5xx
        const result = await businessServiceClient.getPendingReservation({
            userId,
            courseId,
        });
        console.log("Fetched pending reservation:", result);
        res.status(200).json({
            data: result,
        });
    } catch (error) {
        if (isNormalizedDownstreamError(error)) {
            const status = error.status;
            if (status >= 400 && status < 500) {
                return res.status(error.status).json(error.body); // propagate as-is
            }
        }
        return translateDependencyError(res, error, "PENDING_RESERVATION_FETCH_FAILED");
    }
});

/**
 * If successful returns 204
 * Can throw: 400, 502, 503, 504
 * Can propagate errors from other services: 400, 403, 404, 409
 * PROTECTED ROUTE: requires user authentication -> 401
 */
const cancelReservation = asyncHandler(async (req, res) => {
    const { reservationId } = req.params;

    // Get user ID from auth middleware
    const userId = req.user.id;

    if (!reservationId) {
        return sendError(res, 400, "INVALID_REQUEST", "Reservation ID is required.");
    }

    try {
        // Can throw: 400, 403, 404, 409, 5xx
        await businessServiceClient.cancelPendingReservation(reservationId, userId);

        return res.status(204)
    } catch (error) {
        if (isNormalizedDownstreamError(error)) {
            const status = error.status;
            if (status >= 400 && status < 500) {
                return res.status(error.status).json(error.body); // propagate as-is
            }
        }
        return translateDependencyError(res, error, "RESERVATION_CANCEL_FAILED");
    }
});

/**
 * If successful returns 200
 * Can throw: 400, 502, 503, 504
 * PROTECTED ROUTE: requires user authentication -> 401
 */
const getUserBookings = asyncHandler(async (req, res) => {
    // Get user ID from auth middleware
    const userId = req.user.id;

    try {
        // Can throw: 5xx
        const result = await businessServiceClient.getUserBookings(userId);

        res.status(200).json({
            data: result,
        });
    } catch (error) {
        return translateDependencyError(res, error, "USER_BOOKINGS_FETCH_FAILED");
    }
});

module.exports = {
    startBookingProcess,
    getPendingReservation,
    cancelReservation,
    getUserBookings,
    confirmBooking,
};
