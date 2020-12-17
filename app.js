const bcrypt = require("bcryptjs");
require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
var User = require("./models/user");

var cookieParser = require("cookie-parser");
var logger = require("morgan");
var sassMiddleware = require("node-sass-middleware");
const { body, validationResult } = require("express-validator");

// database
mongoose.connect(process.env.MONGURL, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

var indexRouter = require("./routes/index");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// ~ security ~
if (app.get("env") === "production") {
	app.set("trust proxy", 1); // trust first proxy
	sess.cookie.secure = true; // serve secure cookies
}

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));

passport.use(
	new LocalStrategy((username, password, done) => {
		User.findOne({ username: username }, (err, user) => {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, { msg: "Incorrect username" });
			}

			bcrypt.compare(password, user.password, (err, res) => {
				if (res) {
					// passwords match! log user in
					return done(null, user);
				} else {
					// passwords do not match!
					return done(null, false, { msg: "Incorrect password" });
				}
			});

			return done(null, user);
		});
	})
);

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	}).lean();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

app.use(cookieParser());
app.use(
	sassMiddleware({
		src: path.join(__dirname, "public"),
		dest: path.join(__dirname, "public"),
		indentedSyntax: false, // true = .sass and false = .scss
		sourceMap: true,
	})
);
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

app.listen(3000, () => console.log("app listening on port 3000"));

module.exports = app;
