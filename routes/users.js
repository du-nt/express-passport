const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth");
const { getUser, register, login, logout } = require("../controllers/users");

router.get("/auth", auth, getUser);

router.post("/register", register);

router.post("/login", login);

router.get("/logout", auth, logout);

module.exports = router;
