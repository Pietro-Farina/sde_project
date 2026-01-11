const asyncHandler = require("express-async-handler");
const Booking = require("../models/Booking");
const Reservation = require("../models/Reservation");
const mongoose = require("mongoose");

const getUserBookings = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "Missing user ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid User ID" });
    }

    const bookings = await Booking.find({ user: userId });

    return res.status(200).json({
        data: {
            bookings
        }
    });
});

const bookingSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
        },
        user: {
            type: String,
            required: true,
        },
        reservation: {
            type: mongoose.Schema.Types.ObjectId,
        },
        slots: {
            type: [mongoose.Schema.Types.ObjectId],
        },
        status: {
            type: String,
            enum: ["confirmed", "cancelled"],
            default: "confirmed",
        },
        transactionId: {
        },
        price: {
        },
    },
    { timestamps: true }
);

const createBookingWithTransaction = asyncHandler(async (req, res) => {
    const { courseId, userId, reservationId, slots, transactionId, price } = req.body;

    if (!courseId || !userId || !reservationId || !slots || !Array.isArray(slots) || !transactionId || !price) {
        console.log("Invalid booking data:", req.body);
        return res.status(400).json({ error: "Invalid booking data" });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(reservationId)
        || slots.some(slotId => !mongoose.Types.ObjectId.isValid(slotId))) {
        console.log("Something invalid:", { courseId, reservationId, slots });
        return res.status(400).json({ error: "Invalid IDs provided" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const reservation = await Reservation.findById(reservationId).session(session);

        if (!reservation) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Reservation not found" });
        }

        // Create booking
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

        // Confirm reservation
        const result = await Reservation.updateOne(
            { _id: reservationId },
            { $set: { status: "completed" } },
            { session }
        );

        // Commit transaction
        await session.commitTransaction();

        res.status(201).json({
            data: booking[0]
        });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

module.exports = {
    createBookingWithTransaction,
    getUserBookings
};