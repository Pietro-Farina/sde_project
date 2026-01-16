const asyncHandler = require("express-async-handler");
const Booking = require("../models/Booking");
const Reservation = require("../models/Reservation");
const mongoose = require("mongoose");

const getBookings = asyncHandler(async (req, res) => {
    const { userId } = req.query;

    const filter = {};
    if (userId) {
        filter.user = userId;
    }

    const bookings = await Booking.find(filter).lean();

    return res.status(200).json({
        data: {
            bookings
        }
    });
});

const createBookingWithTransaction = asyncHandler(async (req, res) => {
    const { courseId, userId, reservationId, slots, transactionId, price } = req.body;

    console.log("Creating booking with data:", req.body);

    if (!courseId || !userId || !reservationId || !slots || !Array.isArray(slots) || !transactionId || !price) {
        console.log("Invalid booking data:", req.body);
        return res.status(400).json({
            error: {
                code: "INVALID_BOOKING_DATA",
                message: "The provided booking data provided is invalid."
            }
        });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(reservationId)
        || slots.some(slotId => !mongoose.Types.ObjectId.isValid(slotId))) {
        console.log("Something invalid:", { courseId, reservationId, slots });
        return res.status(400).json({
            error: {
                code: "INVALID_IDS",
                message: "One or more provided IDs are not valid."
            }
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const reservation = await Reservation.findById(reservationId).session(session);

        if (!reservation) {
            await session.abortTransaction();
            return res.status(404).json({
                error: {
                    code: "RESERVATION_NOT_FOUND",
                    message: "The specified reservation does not exist."
                }
            });
        }

        // Create booking (single document)
        const booking = await Booking.create(
            [
                {
                    course: courseId,
                    user: userId,
                    reservation: reservationId,
                    slots: slots,
                    transactionId,
                    price
                }
            ],
            { session }
        );

        if (!booking || booking.length === 0) {
            await session.abortTransaction();
            return res.status(500).json({
                error: {
                    code: "BOOKING_CREATION_FAILED",
                    message: "Failed to create the booking."
                }
            });
        }

        // Confirm reservation (check matchedCount since modifiedCount may be 0 if status already set)
        const result = await Reservation.updateOne(
            { _id: reservationId },
            { $set: { status: "completed" } },
            { session }
        );

        if (!result || result.matchedCount === 0) {
            await session.abortTransaction();
            return res.status(500).json({
                error: {
                    code: "RESERVATION_CONFIRMATION_FAILED",
                    message: "Failed to confirm the reservation."
                }
            });
        }

        // Commit transaction
        await session.commitTransaction();

        console.log("Booking created successfully:", booking[0]);

        res.status(201).json({
            data: {
                booking: booking[0]
            }
        });

    } catch (error) {
        await session.abortTransaction();
        throw {
            status: 500,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred while creating the booking."
            }
        };
    } finally {
        session.endSession();
    }
});

module.exports = {
    createBookingWithTransaction,
    getBookings
};