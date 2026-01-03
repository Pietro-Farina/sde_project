const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        user: {
            type: String,
            required: true,
        },
        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reservation",
            required: true,
        },
        slots: {
            type: [mongoose.Schema.Types.ObjectId],
			required: true,
		},
        status: {
            type: String,
            enum: ["confirmed", "cancelled"],
            default: "confirmed",
        },
        transactionId: {
            type: String,
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
