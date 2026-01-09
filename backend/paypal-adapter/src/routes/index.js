const express = require('express');
const router = express.Router();

const ordersRoutes = require('./ordersRoutes');

router.use('/orders', ordersRoutes);
module.exports = router;