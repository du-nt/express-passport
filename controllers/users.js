const passport = require("passport");

const User = require("../models/User");

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

    const user = await User.findOne({ email }).exec();
    if (user) {
      return res.status(404).json({ email: "Email was used" });
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

const linkAccount = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res
        .status(404)
        .json({ message: "Please provide a valid email and password." });
    }
    try {
      const { userId } = req.params;

      const notVerifiedUser = await User.findOne({
        _id: userId,
        email: req.body.email,
      }).lean();

      if (!notVerifiedUser) {
        return res
          .status(404)
          .json({ message: "Please provide a valid email and password." });
      }
      const {
        _id,
        __v,
        avatar,
        isAdmin,
        verify,
        createdAt,
        displayName,
        email,
        updatedAt,
        ...rest
      } = notVerifiedUser;

      user.displayName = user.displayName || notVerifiedUser.displayName;
      user.avatar = user.avatar || notVerifiedUser.avatar;
      Object.keys(rest).forEach((key) => {
        user[key] = rest[key];
      });
      await user.save();
      await User.deleteOne({ _id: notVerifiedUser._id });

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
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

const login = (req, res, next) => {
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
  linkAccount,
  register,
  login,
  logout,
};
