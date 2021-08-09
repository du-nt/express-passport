const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LocalStrategy = require("passport-local").Strategy;

const config = require("../config/key");
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) {
      return done(err);
    }
    done(null, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    (email, password, done) => {
      User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { email: "Email not found" });
        }
        if (!user.password) {
          return done(null, false, {
            email: "Your account was registered using a sign-in provider",
          });
        }

        user.comparePassword(password, (err, isMatch) => {
          if (err) {
            return done(err);
          }
          if (!isMatch) {
            return done(null, false, { password: "Invalid password" });
          }
          done(null, user);
        });
      });
    }
  )
);

/**
 * Sign in with Google.
 */
const googleStrategyConfig = new GoogleStrategy(
  {
    clientID: config.googleClientId,
    clientSecret: config.googleClientSecret,
    callbackURL: "/auth/google/callback",
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne(
      { googleId: profile.id, verify: true },
      (err, existingUser) => {
        if (err) {
          return done(err);
        }
        if (existingUser) {
          return done(null, existingUser);
        }
        User.findOne(
          { email: profile.emails[0].value, verify: true },
          (err, existingLocalUser) => {
            if (err) {
              return done(err);
            }
            if (existingLocalUser) {
              const query = { googleId: profile.id, verify: false };
              const update = {
                email: profile.emails[0].value,
                googleId: profile.id,
                displayName: profile.displayName,
                avatar: profile._json.picture,
                verify: false,
              };
              const options = {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
              };
              User.findOneAndUpdate(query, update, options, (err, user) => {
                if (err) {
                  return done(err);
                }
                return done(null, false, {
                  nextRoute: `/auth/${user.id}/verify?signupMethod=Google&email=${user.email}`,
                });
              });
            } else {
              const user = new User();
              user.email = profile.emails[0].value;
              user.googleId = profile.id;
              user.displayName = profile.displayName;
              user.avatar = profile._json.picture;
              user.save((err) => {
                done(err, user);
              });
            }
          }
        );
      }
    );
  }
);
passport.use("google", googleStrategyConfig);

/**
 * Sign in with Facebook.
 */
const facebookStrategyConfig = new FacebookStrategy(
  {
    clientID: config.facebookClientId,
    clientSecret: config.facebookClientSecret,
    callbackURL: "/auth/facebook/callback",
    profileFields: ["id", "photos", "displayName", "email"],
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne(
      { facebookId: profile.id, verify: true },
      (err, existingUser) => {
        if (err) {
          return done(err);
        }
        if (existingUser) {
          return done(null, existingUser);
        }
        User.findOne(
          {
            email: profile.emails[0].value,
            verify: true,
            password: { $ne: null },
          },
          (err, existingEmailUser) => {
            if (err) {
              return done(err);
            }
            if (existingEmailUser) {
              const query = {
                facebookId: profile.id,
                verify: false,
              };
              const update = {
                email: profile.emails[0].value,
                facebookId: profile.id,
                displayName: profile.displayName,
                avatar: profile.photos[0].value,
                verify: false,
              };
              const options = {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
              };
              User.findOneAndUpdate(query, update, options, (err, user) => {
                if (err) {
                  return done(err);
                }
                return done(null, false, {
                  nextRoute: `/auth/${user.id}/verify?signupMethod=Facebook&email=${user.email}`,
                });
              });
            } else {
              const user = new User();
              user.email = profile.emails[0].value;
              user.facebookId = profile.id;
              user.displayName = profile.displayName;
              user.avatar = profile.photos[0].value;
              user.save((err) => {
                done(err, user);
              });
            }
          }
        );
      }
    );
  }
);
passport.use("facebook", facebookStrategyConfig);
