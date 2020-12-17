const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PostSchema = new Schema(
	{
		message: { type: String, required: true, minlength: 1 },
		subject: { type: String, required: true, minlength: 1 },
		user: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

PostSchema.virtual("date_formatted").get(function () {
	return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATETIME_MED);
});

module.exports = mongoose.model("Post", PostSchema);
