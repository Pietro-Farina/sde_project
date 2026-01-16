const asyncHandler = require("express-async-handler");
const Course = require("../models/Course");
const Reservation = require("../models/Reservation");
const mongoose = require("mongoose");
const cleanupSettings = require("../config/cleanupSettings");

const createReservationWithTransaction = asyncHandler(async (req, res) => {
    const { courseId, slotIds, userId, expiresInMinutes } = req.body;
    console.log("Creating reservation with data:", req.body);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Check if slots exist and have available space
        const course = await Course.findById(courseId).session(session);

        if (!course) {
            await session.abortTransaction();
            return res.status(404).json({
                error: {
                    code: "COURSE_NOT_FOUND",
                    message: "The specified course does not exist."
                }
            });
        }

        // Validate all slots exist and have available space
        const slotsToBook = course.slots.filter((slot) =>
            slotIds.includes(slot._id.toString())
        );

        if (slotsToBook.length !== slotIds.length) {
            await session.abortTransaction();
            return res.status(400).json({
                error: {
                    code: "SLOTS_NOT_FOUND",
                    message: "One or more slots were not found in the specified course."
                }
            });
        }

        const hasAvailability = slotsToBook.every((slot) => slot.available > 0);

        if (!hasAvailability) {
            await session.abortTransaction();
            return res.status(409).json({
                error: {
                    code: "INSUFFICIENT_SLOT_AVAILABILITY",
                    message: "Not enough space in one or more slots."
                }
            });
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
            return res.status(500).json({
                error: {
                    code: "RESERVATION_CREATION_FAILED",
                    message: "Failed to create reservation."
                }
            });
        }

        // Commit transaction
        await session.commitTransaction();

        res.status(201).json({
            data: { reservation: reservation[0] }
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
        return res.status(400).json({
            error: {
                code: "MISSING_RESERVATION_ID",
                message: "Reservation ID is required."
            }
        });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: {
                code: "INVALID_RESERVATION_ID",
                message: "The reservation ID provided is not valid."
            }
        });
    }

    const reservation = await Reservation.findById(id).lean();

    if (!reservation) {
        return res.status(404).json({
            error: {
                code: "RESERVATION_NOT_FOUND",
                message: "The specified reservation does not exist."
            }
        });
    }

    return res.status(200).json({
        data: { reservation }
    });
});

const getReservations = asyncHandler(async (req, res) => {
    const { userId, courseId } = req.query;

    if (courseId && !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
            error: {
                code: "INVALID_COURSE_ID",
                message: "The course ID provided is not valid."
            }
        });
    }

    const filter = {};
    if (userId) {
        filter.user = userId;
    }
    if (courseId) {
        filter.course = courseId;
    }
    const reservations = await Reservation.find(filter).lean();

    return res.status(200).json({
        data: { reservations }
    });
});

const cancelReservationWithTransactionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            error: {
                code: "MISSING_RESERVATION_ID",
                message: "Reservation ID is required."
            }
        });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: {
                code: "INVALID_RESERVATION_ID",
                message: "The reservation ID provided is not valid."
            }
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const reservation = await Reservation.findById(id).session(session);

        if (!reservation) {
            await session.abortTransaction();
            return res.status(404).json({
                error: {
                    code: "RESERVATION_NOT_FOUND",
                    message: "The specified reservation does not exist."
                }
            });
        }

        // Restore available space in each slot
        const course = await Course.findById(reservation.course).session(session);

        if (!course) {
            await session.abortTransaction();
            return res.status(404).json({
                error: {
                    code: "COURSE_NOT_FOUND",
                    message: "Reserved Course not found."
                }
            });
        }

        // Validate all slots exist
        const slotsToBook = course.slots.filter((slot) =>
            reservation.slots.includes(slot._id.toString())
        );
        if (slotsToBook.length !== reservation.slots.length) {
            await session.abortTransaction();
            return res.status(400).json({
                error: {
                    code: "SLOT_NOT_FOUND",
                    message: "One or more slots not found."
                }
            });
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
            return res.status(500).json({
                error: {
                    code: "FAILED_TO_CANCEL_RESERVATION",
                    message: "Failed to cancel reservation"
                }
            });
        }

        // Commit transaction
        await session.commitTransaction();

        res.status(204).send();
    } catch (error) {
        await session.abortTransaction();
        throw {
            status: 500,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred while cancelling the reservation."
            }
        };
    } finally {
        session.endSession();
    }
});

const cleanupExpiredReservations = asyncHandler(async (req, res) => {
    const now = new Date();
    // Find expired 'held' reservations
    const expiredReservations = await Reservation.find({
        status: 'held',
        expiration: { $lt: now }
    }).limit(cleanupSettings.batchSize);

    let cleanedCount = 0;
    let failedCount = 0;

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
            cleanedCount++;
        } catch (error) {
            await session.abortTransaction();
            console.error("Error cleaning up reservation " + reservation._id + ": " + error.message);
            failedCount++;
        } finally {
            session.endSession();
        }
    }
    res.status(200).json({
        data: {
            processed: expiredReservations.length,
            cleaned: cleanedCount,
            failed: failedCount
        }
    });
});

module.exports = {
    createReservationWithTransaction,
    getReservationById,
    getReservations,
    cancelReservationWithTransactionById,
    cleanupExpiredReservations,
};