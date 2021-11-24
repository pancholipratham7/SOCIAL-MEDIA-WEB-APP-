const express = require("express");
const messagesController = require("../controllers/messagesController");
const router = express.Router();

router
  .route("/")
  .post(messagesController.sendMessage)
  .get(messagesController.getAllMessages);

//marking all the messages of a chat as read
router
  .route("/:chatId/markAllMessagesAsRead")
  .put(messagesController.markAllMessagesAsRead);

module.exports = router;
