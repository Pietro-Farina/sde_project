const businessServiceClient = require("../clients/businessServiceClient");
const asyncHandler = require('express-async-handler');
const dataServiceClient = require("../clients/dataServiceClient");


const test = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Booking Controller is working!' });
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

    // if successful, return reservation details and price to pay
    res.status(201).json({
        data: result
    });

    // Start payment process via payment service
});

const getPendingReservation = asyncHandler(async (req, res) => {
    const { userId, courseId } = req.body;

    const result = await businessServiceClient.getPendingReservation({
        userId,
        courseId,
    });

    res.status(200).json({
        data: result
    });
});

const cancelReservation = asyncHandler(async (req, res) => {
    const { reservationId } = req.params;

    const result = await dataServiceClient.cancelReservationById(reservationId);

    res.status(200).json({
        data: result
    });
});

module.exports = {
    test,
    startBookingProcess,
    getPendingReservation,
    cancelReservation,
};