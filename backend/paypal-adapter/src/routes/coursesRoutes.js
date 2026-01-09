const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/coursesController");

router.route("/").get(coursesController.getAllCourses);

router.route("/:id").get(coursesController.getCourseById);

module.exports = router;
