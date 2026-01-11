const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
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
        slots: {
            type: [mongoose.Schema.Types.ObjectId],
            required: true,
        },
        status: {
            type: String,
            enum: ["held", "completed", "cancelled", "expired"],
            default: "held",
        },
        expiration: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
