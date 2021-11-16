const express = require("express");
const messagesController = require("../controllers/messagesController");
const router = express.Router();

router.route("/").post(messagesController.sendMessage);

module.exports = router;
