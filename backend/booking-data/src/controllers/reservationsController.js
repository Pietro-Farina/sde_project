const asyncHandler = require("express-async-handler");
const Course = require("../models/Course");
const Reservation = require("../models/Reservation");
const mongoose = require("mongoose");
const cleanupSettings = require("../config/cleanupSettings");

const createReservationWithTransaction = asyncHandler(async (req, res) => {
    const { courseId, slotIds, userId, expiresInMinutes } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Check if slots exist and have available space
        const course = await Course.findById(courseId).session(session);

        if (!course) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Course not found" });
        }

        // Validate all slots exist and have available space
        const slotsToBook = course.slots.filter((slot) =>
            slotIds.includes(slot._id.toString())
        );

        if (slotsToBook.length !== slotIds.length) {
            await session.abortTransaction();
            return res.status(400).json({ error: "One or more slots not found" });
        }

        const hasAvailability = slotsToBook.every((slot) => slot.available > 0);

        if (!hasAvailability) {
            await session.abortTransaction();
            return res.status(409).json({ error: "Not enough space in one or more slots" });
        }

        // 2. Subtract available space from each slot
        for (const slotId of slotIds) {
            await Course.updateOne(
                { _id: courseId, "slots._id": slotId },
                { $inc: { "slots.$.available": -1 } },
                { session }
            );
        }

        // 3. Create reservation
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + expiresInMinutes);

        const reservation = await Reservation.create(
            [
                {
                    course: courseId,
                    user: userId,
                    slots: slotIds,
                    status: "held",
                    expiration: expirationDate,
                },
            ],
            { session }
        );

        if (!reservation) {
            await session.abortTransaction();
            return res.status(500).json({ error: "Failed to create reservation" });
        }

        // Commit transaction
        await session.commitTransaction();

        res.status(201).json({
            data: reservation[0]
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

const getReservationById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Reservation ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Reservation ID" });
    }

    const reservation = await Reservation.findById(id).lean();

    if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    return res.status(200).json({
        data: reservation
    });
});

const getAllReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find().lean();

    return res.status(200).json({
        data: reservations
    });
});

const updateReservationStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Reservation ID" });
    }
    if (!["held", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    // Update reservation status
});

/**
 * TODO: define when the course slots' availability should be restored
 */
const cancelReservationWithTransactionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Reservation ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Reservation ID" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const reservation = await Reservation.findById(id).session(session);

        if (!reservation) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Reservation not found" });
        }

        // Restore available space in each slot
        const course = await Course.findById(reservation.course).session(session);

        if (!course) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Reserved Course not found" });
        }

        // Validate all slots exist
        const slotsToBook = course.slots.filter((slot) =>
            reservation.slots.includes(slot._id.toString())
        );
        if (slotsToBook.length !== reservation.slots.length) {
            await session.abortTransaction();
            return res.status(400).json({ error: "One or more slots not found" });
        }
        for (const slotId of reservation.slots) {
            await Course.updateOne(
                { _id: reservation.course, "slots._id": slotId },
                { $inc: { "slots.$.available": 1 } },
                { session }
            );
        }

        // Cancel reservation
        const result = await Reservation.updateOne(
            { _id: id },
            { $set: { status: "cancelled" } },
            { session }
        );

        if (!result || result.modifiedCount === 0) {
            await session.abortTransaction();
            return res.status(500).json({ error: "Failed to cancel reservation" });
        }

        // Commit transaction
        await session.commitTransaction();

        res.status(200).json({
            message: "Reservation cancelled successfully"
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

const deleteReservationById = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Reservation ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Reservation ID" });
    }

    const result = await Reservation.deleteOne({ _id: id });

    if (!result || result.deletedCount === 0) {
        return res.status(404).json({ error: "Reservation not found or already deleted" });
    }
    return res.status(204).send();
});

const cleanupExpiredReservations = asyncHandler(async (req, res) => {
    const now = new Date();
    // Find expired 'held' reservations
    const expiredReservations = await Reservation.find({
        status: 'held',
        expiration: { $lt: now }
    }).limit(cleanupSettings.batchSize);

    for (const reservation of expiredReservations) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Restore slot availability
            const course = await Course.findById(reservation.course).session(session);
            if (!course) throw new Error('Course not found for reservation ' + reservation._id);

            // Validate all slots exist
            const slotsToRestore = course.slots.filter(slot => reservation.slots.includes(slot._id.toString()));
            if (slotsToRestore.length !== reservation.slots.length) throw new Error('Slot mismatch for reservation ' + reservation._id);

            for (const slotId of reservation.slots) {
                await Course.updateOne(
                    { _id: reservation.course, 'slots._id': slotId },
                    { $inc: { 'slots.$.available': 1 } },
                    { session }
                );
            }
            // Cancel reservation
            const result = await Reservation.updateOne(
                { _id: reservation._id },
                { $set: { status: "cancelled" } },
                { session }
            );

            if (!result || result.modifiedCount === 0) {
                throw new Error("Failed to cancel reservation " + reservation._id);
            }

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            console.error("Error cleaning up reservation " + reservation._id + ": " + error.message);
        } finally {
            session.endSession();
        }
    }
});

module.exports = {
    createReservationWithTransaction,
    getReservationById,
    getAllReservations,
    cancelReservationWithTransactionById,
    cleanupExpiredReservations,
    // updateReservationStatus,
    // deleteReservationById,
};