const express = require("express");
const postController = require("../controllers/postController");
const userController = require("../controllers/userController");

const router = express.Router();

router
  .route("/")
  .post(userController.isLoggedIn, postController.createPost)
  .get(userController.isLoggedIn, postController.getAllPosts);
router
  .route("/:postId/like")
  .put(userController.isLoggedIn, postController.controlPostLike);
router
  .route("/:postId/retweet")
  .post(userController.isLoggedIn, postController.controlRetweet);
router
  .route("/:postId")
  .get(userController.isLoggedIn, postController.getPost)
  .delete(userController.isLoggedIn, postController.deletePost);

router
  .route("/:postId/pin")
  .put(userController.isLoggedIn, postController.pinPost);
module.exports = router;
