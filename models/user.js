const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		first_name: { type: String, required: true, trim: true, minlength: 1 },
		last_name: { type: String, required: true, trim: true, minlength: 1 },
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please fill a valid email address",
			],
		},
		hash: { type: String, required: true, minlength: 1 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
