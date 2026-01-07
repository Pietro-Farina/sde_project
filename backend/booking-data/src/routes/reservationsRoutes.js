const express = require("express");
const router = express.Router();
const reservationsController = require("../controllers/reservationsController");

router
    .get("/", reservationsController.getAllReservations)
    .post("/", reservationsController.createReservationWithTransaction);

router
    .get("/:id", reservationsController.getReservationById);

module.exports = router;