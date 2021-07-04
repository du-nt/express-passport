const passport = require("passport");

const User = require("../models/User");
const validateRegisterInput = require("../validations/register");
const validateLoginInput = require("../validations/login");

const getUser = (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.isAdmin,
    email: req.user.email,
    displayName: req.user.displayName,
    avatar: req.user.avatar,
  });
};

const register = async (req, res) => {
  try {
    const { email, displayName, password } = req.body;

    const { isValid, errors } = validateRegisterInput(req.body);

    if (!isValid) {
      return res.status(404).json(errors);
    }

    const user = await User.findOne({ email }).exec();
    if (user) {
      errors.email = "Email was used";
      return res.status(404).json(errors);
    }

    const newUser = new User({
      displayName,
      email,
      password,
    });
    await newUser.save();
    res.status(200).json({
      registerSuccess: true,
    });
  } catch (err) {
    res.status(404).json({ registerSuccess: false, error: err.message });
  }
};

const login = (req, res, next) => {
  const { isValid, errors } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(404).json(errors);
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(404).json(info);
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        _id: user._id,
        isAdmin: user.isAdmin,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
      });
    });
  })(req, res, next);
};

const logout = (req, res) => {
  req.logout();
  res.status(200).json({
    logoutSuccess: true,
  });
};

module.exports = {
  getUser,
  register,
  login,
  logout,
};
