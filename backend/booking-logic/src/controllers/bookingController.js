const dataServiceClient = require('../clients/dataServiceClient');
const asyncHandler = require('express-async-handler')
const bookingSettings = require('../config/bookingSettings');

// Reservations
/**
 * Can throw: 201, 400, 409, 500
 * Can propagate errors from other services: 400, 404, 409, 500
 */
const createReservation = asyncHandler(async (req, res) => {
    console.log("Create reservation request body:", req.body);
    // Logic to create a reservation
    const { userId, courseId, slotIds } = req.body;

    // Can the user book the course? Do we have all data?
    if (!userId || !courseId || !slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
        return res.status(400).json({
            error: {
                code: "INVALID_RESERVATION_DATA",
                message: "The provided reservation data is invalid."
            }
        });
    }

    // Check the course and slot availability from data service
    // -> either 200 or 500
    const { course } = await dataServiceClient.getCourseById(courseId);

    const unavailableSlots = slotIds.filter(slotId => {
        const slot = course.slots.find(s => s._id.toString() === slotId);
        return !slot || slot.available <= 0;
    });
    if (unavailableSlots.length > 0) {
        return res.status(409).json({
            error: {
                code: "SLOTS_NOT_AVAILABLE",
                message: "One or more selected slots are not available."
            }
        });
    }

    // check pricing options
    const priceOption = course.priceOptions.find(option => option.numberSlots === slotIds.length);
    if (!priceOption) {
        return res.status(400).json({
            error: {
                code: "NO_PRICING_OPTION",
                message: "No pricing option for the selected number of slots"
            }
        });
    }

    // if everything is valid, create the reservation in booking-data service
    const reservationData = {
        userId,
        courseId,
        slotIds,
        expiresInMinutes: bookingSettings.reservationExpirationMinutes,
    };
    // 201, 400, 409, 500
    const { reservation } = await dataServiceClient.createReservationIfAvailable(reservationData);

    // TODO DECIDE WHAT TO RETURN HERE
    return res.status(201).json({
        data: {
            reservationId: reservation._id,
            priceToPay: priceOption.price
        }
    });
});

/**
 * Can throw: 400, 404, 500
 * Can propagate errors from other services: 400, 500
 */
const getActiveCourseReservationForUser = asyncHandler(async (req, res) => {
    console.log("Get active course reservation request query:", req.query);
    const { courseId, userId } = req.query;
    console.log(req.query);

    if (!userId || !courseId) {
        console.log("Missing userId or courseId", userId, courseId);
        return res.status(400).json({
            error: {
                code: "MISSING_QUERY_PARAMS",
                message: "Both userId and courseId query parameters are required."
            }
        });
    }

    // Fetch all reservations from booking-data service
    // Can throw 400, 500
    const { reservations } = await dataServiceClient.getCourseReservationsByUserId({ userId, courseId });

    // Filter active reservations
    const now = new Date();
    const activeReservations = reservations.filter(reservation => {
        if (reservation.status !== "held") {
            return false;
        }
        if (new Date(reservation.expiration) < now) {
            return false;
        }
        return true;
    });
    if (activeReservations.length === 0) {
        return res.status(404).json({
            error: {
                code: "NO_ACTIVE_RESERVATION",
                message: "No active reservation found for the specified user and course."
            }
        });
    }
    const lastReservation = activeReservations[activeReservations.length - 1];

    res.status(200).json({
        data: lastReservation
    });
});

/**
 * Can throw: 204, 400, 403, 409, 500
  * Can propagate errors from other services: 400, 404, 409, 500
 */
const cancelReservation = asyncHandler(async (req, res) => {
    console.log("Cancel reservation request body:", req.body);
    // Logic to cancel a reservation by ID
    const { userId } = req.body;
    const { id } = req.params;

    if (!id || !userId) {
        return res.status(400).json({
            error: {
                code: "MISSING_DATA",
                message: "Reservation ID and userId are required to cancel a reservation."
            }
        });
    }

    // Fetch reservation details from booking-data service
    // 400, 404, 500
    const { reservation } = await dataServiceClient.getReservationById(id);

    // IS HELD? then free up slots in the course
    if (reservation.user.toString() !== userId) {
        return res.status(403).json({
            error: {
                code: "ACCESS_DENIED",
                message: "User do not have permission to cancel this reservation."
            }
        });
    }

    if (reservation.status !== "held") {
        return res.status(409).json({
            error: {
                code: "RESERVATION_NOT_ACTIVE",
                message: "Reservation cannot be canceled as it is not active"
            }
        });
    }

    // proceed to cancel reservation
    // 204, 400, 404, 500
    await dataServiceClient.safeCancelReservationById(id);

    return res.status(204);
})

// Bookings
/**
 * Can throw: 201, 400, 403, 409, 500
 * Can propagate errors from other services: 400, 404, 500
 */
const createBooking = asyncHandler(async (req, res) => {
    console.log("Create booking request body:", req.body);
    const { userId, reservationId, transactionId, price } = req.body;

    // I do all the check
    if (!userId || !reservationId || !transactionId || !price) {
        return res.status(400).json({
            error: {
                code: "INVALID_BOOKING_DATA",
                message: "Missing required booking data."
            }
        });
    }

    // I evaluate if the reservations exists, is held, belongs to the user, not expired
    // 400, 404, 500
    const { reservation } = await dataServiceClient.getReservationById(reservationId);

    if (reservation.user.toString() !== userId) {
        return res.status(403).json({
            error: {
                code: "ACCESS_DENIED",
                message: "User do not have permission to access this reservation."
            }
        });
    }

    if (reservation.status !== "held") {
        return res.status(409).json({
            error: {
                code: "RESERVATION_NOT_ACTIVE",
                message: "Reservation is not active"
            }
        });
    }

    if (new Date(reservation.expiration) < new Date()) {
        return res.status(409).json({
            error: {
                code: "RESERVATION_EXPIRED",
                message: "Reservation has expired"
            }
        });
    }

    // I then issue the creation of the booking and the completion of the reservation in a transaction
    // 400, 404, 500
    const { booking: newBooking } = await dataServiceClient.createBooking({
        courseId: reservation.course.toString(),
        userId,
        reservationId,
        slots: reservation.slots,
        transactionId,
        price
    });

    return res.status(201).json({
        data: newBooking
    });
});

/**
 * Can throw: 200, 500
 * Can propagate errors from other services: 500
 */
const getBookings = asyncHandler(async (req, res) => {
    console.log("Get bookings request query:", req.query);
    const { userId } = req.query;

    const { bookings } = userId ? await dataServiceClient.getUserBookings(userId)
        : await dataServiceClient.getAllBookings();
    console.log("Bookings retrieved:", bookings.length);
    return res.status(200).json({
        data: {
            bookings
        }
    });
});

module.exports = {
    createReservation,
    getActiveCourseReservationForUser,
    cancelReservation,
    createBooking,
    getBookings
};