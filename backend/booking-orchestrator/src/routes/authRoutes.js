const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require("../middleware/requireAuth");

router.get('/login/:provider', authController.login);

router.get('/complete', authController.completeLogin);

router.post('/logout', authController.logout);

router.post('/refresh', authController.refreshAccessToken);

router.get("/me", requireAuth, (req, res) => {
    res.status(200).json({
        authenticated: true,
        userId: req.user.id,
        picture: req.user.picture
    });
});

router.post('/internal/assert', authController.oauthAssert);

module.exports = router;