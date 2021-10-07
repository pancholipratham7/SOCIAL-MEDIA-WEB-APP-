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

router
  .route("/post/:postId")
  .get(userController.isLoggedIn, viewController.getPostPage);

router.route("/logout").get(userController.isLoggedIn, authController.logout);

//route for followers and following page
router
  .route("/profile/:userName/followers")
  .get(userController.isLoggedIn, viewController.getFollowersPage);

router.route("/profile/:userName/following").get(userController.isLoggedIn, viewController.getFollowingPage);

//route for checking anyone else's profile
router
  .route("/profile/:userName/replies")
  .get(userController.isLoggedIn, viewController.getProfilePageWithRepliesTab);

//route for checking anyone else's profile
router
  .route("/profile/:userName")
  .get(userController.isLoggedIn, viewController.getProfilePage);

//route for user's own profile
router
  .route("/profile")
  .get(userController.isLoggedIn, viewController.getLoggedInUserProfilePage);

module.exports = router;
