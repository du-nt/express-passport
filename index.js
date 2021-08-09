const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const cookieSession = require("cookie-session");

const config = require("./config/key");
const { notLogged } = require("./middlewares/auth");

const port = process.env.PORT || 5000;

require("./config/passport");

const app = express();

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.error(err));

app.use(
  cookieSession({
    maxAge: 1209600000, // two weeks in milliseconds
    keys: [config.cookieEncryptionKey], //
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use(helmet());

app.use(morgan("dev"));

app.use(cors());

app.use("/api/users", require("./routes/users"));

app.get(
  "/auth/google",
  notLogged,
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get("/auth/google/callback", function (req, res, next) {
  passport.authenticate("google", function (err, user, { nextRoute }) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect(`${config.clientUrl}${nextRoute}`);
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect(config.clientUrl);
    });
  })(req, res, next);
});

app.get("/auth/facebook", notLogged, passport.authenticate("facebook"));

app.get("/auth/facebook/callback", function (req, res, next) {
  passport.authenticate("facebook", function (err, user, { nextRoute }) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect(`${config.clientUrl}${nextRoute}`);
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect(config.clientUrl);
    });
  })(req, res, next);
});

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  // All the javascript and css files will be read and served from this folder
  app.use(express.static("client/build"));

  // index.html for all page routes  html or routing and naviagtion
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server Running at ${port}`);
});
