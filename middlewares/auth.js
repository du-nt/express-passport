const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).json({
      isAuth: false,
      error: "Not permitted",
    });
  }
};

const adminGuard = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(401).json({
      isAuth: false,
      error: "Only admin user can do this",
    });
  }
  next();
};

module.exports = { auth, adminGuard };
