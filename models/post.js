const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PostSchema = new Schema(
	{
		text: { type: String, required: true, minlength: 1 },
		subject: { type: String, required, minlength: 1 },
		user: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
