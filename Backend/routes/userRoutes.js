const express = require("express");
const router = express.Router();
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);

router
  .route("/")
  .get(userController.getAllUser)
  .post(userController.createUser);

router.route("/unmapfromadmin/:id").post(authController.unmapUserFromAdmin);
router.route("/mapbyadmin/:id").post(authController.mapUserToAdmin);
router.route("/claim").get(authController.getClaimUser);
router.route("/admin").get(authController.getUserByAdmin);
router.route("/:id").get(userController.getUser);

module.exports = router;
