// src/routes/auth.js
const router = require("express").Router();
const passport = require("passport");
const auth = passport.authenticate("jwt", { session: false });
const { login, refresh, logout } = require("../controllers/authController");

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", auth, logout);

module.exports = router;
