const express = require("express");
const router = express.Router();
const reservationsController = require("../controllers/reservationsController");

router
    .get("/", reservationsController.getReservations)
    .post("/", reservationsController.createReservationWithTransaction);

router
    .patch("/cleanup", reservationsController.cleanupExpiredReservations);

router
    .get("/:id", reservationsController.getReservationById)
    .patch("/:id/cancel", reservationsController.cancelReservationWithTransactionById);

module.exports = router;