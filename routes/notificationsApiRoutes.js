const express = require("express");
const notificationController = require("./../controllers/notificationController");
const router = express.Router();

router.route("/").get(notificationController.getAllNotifications);
router.route("/latest").get(notificationController.getLatestNotification);

router
  .route("/:id/markAsOpened")
  .put(notificationController.markNotificationAsOpened);

router
  .route("/markAsOpened")
  .put(notificationController.markAllNotificationAsOpened);

module.exports = router;
