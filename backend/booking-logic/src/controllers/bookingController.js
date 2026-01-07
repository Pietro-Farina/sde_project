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
    const course = await dataServiceClient.getCourseById(courseId);
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
    const reservation = await dataServiceClient.createReservationIfAvailable(reservationData);

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

const getUserReservationById = asyncHandler(async (req, res) => {
    const { id, userId } = req.body;

    if (!id || !userId) {
        return res.status(400).json({ error: "Missing reservation ID or user ID" });
    }

    // Fetch reservation details from booking-data service
    const reservation = await dataServiceClient.getReservationById(id);

    if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    // Can the user access this reservation?
    if (reservation.user.toString() !== userId) {
        return res.status(403).json({ error: "Access denied to this reservation" });
    }

    // is the reservation still valid?
    const now = new Date();
    if (reservation.status !== "held") {
        return res.status(409).json({ error: `Reservation is already ${reservation.status}` });
    }
    // if expired but still 'held' then safely expire it and free up slots in the course
    if (new Date(reservation.expiration) < now) {
        void dataServiceClient.safeCancelReservationById(id); // safely expire it

        return res.status(410).json({ error: "Reservation has expired" });
    }

    // return reservation details if all checks pass
    res.status(200).json({
        data: reservation
    });
});

const getActiveCourseReservationForUser = asyncHandler(async (req, res) => {
    const { courseId, userId } = req.body;

    if (!userId || !courseId) {
        return res.status(400).json({ error: "Missing user ID or course ID" });
    }

    // Fetch all reservations from booking-data service
    const reservations = await dataServiceClient.getCourseReservationsByUserId({  userId, courseId });

    // Filter active reservations
    const now = new Date();
    const activeReservations = reservations.filter(reservation => {
        if (reservation.status !== "held") {
            return false;
        }
        if (new Date(reservation.expiration) < now) {
            // safely expire it
            void dataServiceClient.safeCancelReservationById(reservation._id);
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
    const reservation = await dataServiceClient.getReservationById(id);

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

const cancelExpiredReservations = asyncHandler(async (req, res) => {
    // Logic to find and cancel all expired reservations

    // Fetch all reservations from booking-data service
});

module.exports = {
    createReservation,
    getActiveCourseReservationForUser,
    cancelReservation,
};