const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const userController = require("./../controllers/userController");
const router = express.Router();

router.route("/:userId/follow").put(userController.follow);
router.route("/:userId/followers").get(userController.getFollowers);
router.route("/:userId/following").get(userController.getFollowing);
router
  .route("/profilePicture")
  .post(upload.single("croppedImage"), userController.uploadProfilePicture);

module.exports = router;
