const express = require("express");
const router = express.Router();
const taskController = require("./../controllers/taskController");
const authController = require("./../controllers/authController");

router
  .route("/")
  .get(taskController.getAllTask)
  .post(taskController.createTask);

router.route("/:id/status").patch(authController.updateTaskStatus);

router.route("/taskbyuser").get(authController.getTasksByUser);

router.route("/taskbyadmin").get(authController.gettaskByadmin);

router
  .route("/:id")
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
