const express = require("express");
const router = express.Router();
const loginLimiter = require("../../middleware/loginLimiter");
const { handleLogin } = require("../../controllers/authController");

router.route("/").post(loginLimiter, handleLogin);

module.exports = router;
