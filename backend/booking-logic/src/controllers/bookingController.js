const dataServiceClient = require('../clients/dataServiceClient');
const asyncHandler = require('express-async-handler')
const bookingSettings = require('../config/bookingSettings');

const createReservation = asyncHandler(async (req, res) => {
    // Logic to create a reservation
    const { userId, courseId, slotIds } = req.body;

    // Can the user book the course? Do we have all data?
    if (!userId || !courseId || !slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
        return res.status(400).json({ error: "Invalid reservation data" });
    }
  
    // Check the course and slot availability from data service
    const { course } = await dataServiceClient.getCourseById(courseId);
    if (!course) {
        return res.status(400).json({ error: "Invalid reservation data" });
    }
    const unavailableSlots = slotIds.filter(slotId => {
        const slot = course.slots.find(s => s._id.toString() === slotId);
        return !slot || slot.available <= 0;
    });
    if (unavailableSlots.length > 0) {
        return res.status(409).json({ error: "One or more selected slots are not available" });
    }

    // check pricing options
    const priceOption = course.priceOptions.find(option => option.numberSlots === slotIds.length);
    if (!priceOption) {
        return res.status(400).json({ error: "No pricing option for the selected number of slots" });
    }

    // if everything is valid, create the reservation in booking-data service
    const reservationData = {
        userId,
        courseId,
        slotIds,
        expiresInMinutes: bookingSettings.reservationExpirationMinutes,
    };
    const { reservation } = await dataServiceClient.createReservationIfAvailable(reservationData);

    if (!reservation) {
        return res.status(500).json({ error: "Failed to create reservation" });
    }

    return res.status(201).json({
        data: {
            reservationId: reservation._id,
            priceToPay: priceOption.price
        }
    });
});

const getActiveCourseReservationForUser = asyncHandler(async (req, res) => {
    const { courseId, userId } = req.body;
    console.log(req.body);

    if (!userId || !courseId) {
        console.log("Missing userId or courseId", userId, courseId);
        return res.status(400).json({ error: "Missing user ID or course ID" });
    }

    // Fetch all reservations from booking-data service
    const { reservations } = await dataServiceClient.getCourseReservationsByUserId({  userId, courseId });

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
        return res.status(404).json({ error: "No active reservations found" });
    }
    const lastReservation = activeReservations[activeReservations.length - 1];
    
    res.status(200).json({
        data: lastReservation
    });
});

const cancelReservation = asyncHandler(async (req, res) => {
    // Logic to cancel a reservation by ID
    const { id, userId } = req.body;

    if (!id || !userId) {
        return res.status(400).json({ error: "Missing reservation ID or user ID" });
    }

    // Fetch reservation details from booking-data service
    const { reservation } = await dataServiceClient.getReservationById(id);

    if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    // IS HELD? then free up slots in the course
    if (reservation.user.toString() !== userId) {
        return res.status(403).json({ error: "Access denied to this reservation" });
    }

    if (reservation.status === "held") {
        // proceed to cancel reservation
        const result = await dataServiceClient.safeCancelReservationById(id);

        if (!result) {
            return res.status(500).json({ error: "Failed to cancel reservation" });
        }

        return res.status(200).json({
            data: result
        });
    }

    return res.status(409).json({ error: "Reservation not active" });
})

const createBooking = asyncHandler(async (req, res) => {
    const { userId, reservationId, transactionId, price } = req.body;

    // I do all the check
    if (!userId || !reservationId || !transactionId || !price) {
        return res.status(400).json({ error: "Invalid booking data" });
    }
    
    // I evaluate if the reservations exists, is held, belongs to the user, not expired
    const { reservation } = await dataServiceClient.getReservationById(reservationId);

    if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.user.toString() !== userId) {
        return res.status(403).json({ error: "Access denied to this reservation" });
    }

    if (reservation.status !== "held") {
        return res.status(409).json({ error: "Reservation is not active" });
    }

    if (new Date(reservation.expiration) < new Date()) {
        return res.status(409).json({ error: "Reservation has expired" });
    }

    // I then issue the creation of the booking and the completion of the reservation in a transaction
    const { booking: newBooking } = await dataServiceClient.createBooking({
        courseId: reservation.course.toString(),
        userId,
        reservationId,
        slots: reservation.slots,
        transactionId,
        price
    });

    if (!newBooking) {
        return res.status(500).json({ error: "Failed to create booking" });
    }

    return res.status(201).json({
        data: newBooking
    });
});

const getUserBookings = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "Missing user ID" });
    }

    const { bookings } = await dataServiceClient.getUserBookings(userId);

    return res.status(200).json({
        data: bookings
    });
});

module.exports = {
    createReservation,
    getActiveCourseReservationForUser,
    cancelReservation,
    createBooking,
    getUserBookings
};