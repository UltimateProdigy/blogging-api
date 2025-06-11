const express = require("express");
const router = express.Router();
const { handleCreateUser } = require("../../controllers/registerController")

router.route("/").post(handleCreateUser);

module.exports = router;
