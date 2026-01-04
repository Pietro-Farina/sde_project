const dataServiceClient = require('../clients/dataServiceClient');
const asyncHandler = require('express-async-handler')


const test = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Booking Controller is working!' });
});

module.exports = {
    test,
};