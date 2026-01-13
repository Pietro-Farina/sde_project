const express = require('express');
const router = express.Router();

const oauthRoutes = require('./googleOauthRoutes');

router.use('/google', oauthRoutes);

module.exports = router;