const express = require("express");
const chatController = require("../controllers/chatController");
const router = express.Router();

router.route("/").post(chatController.createChat).get(chatController.getChats);

router.route("/:chatId").put(chatController.updateChatName).get(chatController.getAChat);

module.exports = router;
