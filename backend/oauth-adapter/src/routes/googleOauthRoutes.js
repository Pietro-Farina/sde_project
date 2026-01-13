const express = require("express");
const router = express.Router();
const oauthController = require("../controllers/googleOauthController");

router.get("/login", oauthController.startGoogleLogin);

router.get("/callback", oauthController.googleCallback);

module.exports = router;
