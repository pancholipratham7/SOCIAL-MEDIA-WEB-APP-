const express = require("express");
const postController = require("../controllers/postController");

const router = express.Router();

router
  .route("/")
  .post(postController.createPost)
  .get(postController.getAllPosts);
router.route("/:postId/like").put(postController.controlPostLike);
router.route("/:postId/retweet").post(postController.controlRetweet);

module.exports = router;
