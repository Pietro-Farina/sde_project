const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		slots: [
			{
				start: {
					type: Date,
					required: true,
				},
				end: {
					type: Date,
					required: true,
				},
				capacity: {
					type: Int32,
					required: true,
				},
				available: {
					type: Int32,
					required: true,
				},
			},
		],
		open: {
			type: Boolean,
			default: true,
		},
		priceOptions: [
			{
				numberSlots: {
					type: Int32,
					required: true,
				},
				price: {
					type: String,
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
