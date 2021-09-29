const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const viewController = require("../controllers/viewController");

const router = express.Router();

//Home page
router.route("/").get(userController.isLoggedIn, viewController.getHomePage);

router
  .route("/login")
  .get(viewController.getLoginPage)
  .post(authController.login);

router
  .route("/register")
  .get(viewController.getRegisterPage)
  .post(authController.register);

router.route("/logout").get(authController.logout);
module.exports = router;
