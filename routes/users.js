const express = require("express");
const router = express.Router();

const { isLogged, notLogged } = require("../middlewares/auth");
const {
  loginValidate,
  registerValidate,
  verifyValidate,
} = require("../middlewares/validate");
const {
  getUser,
  linkAccount,
  register,
  login,
  logout,
} = require("../controllers/users");

router.post("/:userId/verify", notLogged, verifyValidate, linkAccount);

router.get("/auth", isLogged, getUser);

router.post("/register", notLogged, registerValidate, register);

router.post("/login", notLogged, loginValidate, login);

router.get("/logout", isLogged, logout);

module.exports = router;
