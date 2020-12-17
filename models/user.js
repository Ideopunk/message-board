const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		first_name: { type: String, required: true, trim: true, minlength: 1 },
		last_name: { type: String, required: true, trim: true, minlength: 1 },
		username: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please fill a valid email address",
			],
		},
		password: { type: String, required: true, minlength: 1 },
		status: { type: String, enum: ["basic", "member", "admin"], default: "basic" },
	},
	{ timestamps: true }
);

UserSchema.virtual("full_name").get(function () {
	return `${this.first_name} ${this.last_name}`;
});

module.exports = mongoose.model("User", UserSchema);
