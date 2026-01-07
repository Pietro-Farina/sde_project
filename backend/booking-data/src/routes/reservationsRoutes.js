const express = require("express");
const router = express.Router();
const reservationsController = require("../controllers/reservationsController");

router
    .get("/", reservationsController.getAllReservations)
    .post("/", reservationsController.createReservationWithTransaction);

router
    .post("/cleanup-expired", reservationsController.cleanupExpiredReservations);

router
    .get("/:id", reservationsController.getReservationById)
    .patch("/:id/cancel", reservationsController.cancelReservationWithTransactionById);

module.exports = router;