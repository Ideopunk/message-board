const bcrypt = require("bcryptjs");
var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const Post = require("../models/post");
const passport = require("passport");

/* GET home page. */
router.get("/", (req, res, next) =>
	Post.find({})
		.populate("user")
		.exec((err, list_posts) => {
			if (err) {
				return next(err);
			}

			if (!req.user || req.user.status === "basic") {
				let modified_list_posts = [];
				for (let post of list_posts) {
					modified_list_posts.push({
						subject: post.subject,
						date_formatted: post.date_formatted,
						message: post.message,
					});
				}

				res.render("index", {
					title: "The Club",
					user: req.user,
					basic: req.user?.status === "basic" ? true : false,
					admin: req.user?.status === "admin" ? true : false,
					posts: modified_list_posts,
				});
			} else {
				res.render("index", {
					title: "The Club",
					user: req.user,
					basic: req.user?.status === "basic" ? true : false,
					admin: req.user?.status === "admin" ? true : false,
					posts: list_posts,
				});
			}
		})
);

router.get("/sign-up", (req, res) => res.render("sign-up"));

router.post(
	"/sign-up",
	[
		body("first").trim().isLength({ min: 1 }).escape(),
		body("last").trim().isLength({ min: 1 }).escape(),
		body("username").trim().isLength({ min: 1 }).escape(),
		body("password").isLength({ min: 8 }),
		body("confirm")
			.isLength({ min: 8 })
			.custom((value, { req }) => value === req.body.password),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
			if (err) {
				return next(err);
			}
			const user = new User({
				first_name: req.body.first,
				last_name: req.body.last,
				username: req.body.username,
				password: hashedPassword,
			}).save((err) => {
				if (err) {
					return next(err);
				}
				res.redirect("/");
			});
		});
	}
);

router.get("/join", (req, res) => {
	if (!req.user || req.user.status === "member") {
		res.redirect("/");
	} else {
		res.render("join");
	}
});

router.post(
	"/join",
	[body("code").custom((value) => Number(value) === Number(process.env.CLUB_PASS))],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render("join", {
				error: "Wrong number",
			});
			return;
		}

		const user = new User({
			first_name: req.user.first_name,
			last_name: req.user.last_name,
			username: req.user.username,
			password: req.user.password,
			status: "member",
			_id: req.user._id,
		});

		User.findByIdAndUpdate(req.user._id, user, {}, function (err, theuser) {
			if (err) {
				return next(err);
			}
			res.redirect("/");
		});
	}
);

router.get("/log-in", (req, res) => {
	res.render("log-in");
});

router.post(
	"/log-in",
	passport.authenticate("local", { successRedirect: "/", failureRedirect: "/" })
);

router.get("/log-out", (req, res) => {
	req.logout();
	res.redirect("/");
});

router.post(
	"/message",
	[
		body("subject").trim().isLength({ min: 1 }).escape(),
		body("message").trim().isLength({ min: 1 }).escape(),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const message = new Post({
			subject: req.body.subject,
			message: req.body.message,
			user: req.user._id,
		});

		message.save((err) => {
			if (err) {
				return next(err);
			}
			res.redirect("/");
		});
	}
);
module.exports = router;
