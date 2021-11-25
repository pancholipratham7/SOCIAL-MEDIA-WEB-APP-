const Chat = require("../models/chatModel");
const Message = require("./../models/messageModel");
const User = require("./../models/userModel");
const Notification = require("./../models/notificationsModel");

exports.sendMessage = (req, res, next) => {
  if (!req.body.chat || !req.body.content) {
    return res.status(400).json({
      status: "failed",
    });
  }
  const newMessage = {
    content: req.body.content,
    sender: req.session.user._id,
    chat: req.body.chat,
  };

  Message.create(newMessage)
    .then(async (doc) => {
      let message = await doc.populate("sender");
      message = await message.populate("chat");
      message = await User.populate(message, { path: "chat.users" });

      //If the message is successfully stored then we need to updated the chat latest message with this message
      const chat = await Chat.findByIdAndUpdate(req.body.chat, {
        latestMessage: message,
      });
      insertNewMessageNotification(chat, message);

      res.status(200).json({
        status: "success",
        message,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "failed",
        error: "Could not send the message",
      });
    });
};

//getting all the previous messages
exports.getAllMessages = async (req, res, next) => {
  const messages = await Message.find({ chat: req.query.chatId })
    .sort({ createdAt: "asc" })
    .populate("sender");
  res.status(200).json({
    status: "success",
    messages,
  });
};

//marking all messages as read
exports.markAllMessagesAsRead = async (req, res, next) => {
  await Message.updateMany(
    { chat: req.params.chatId },
    { $addToSet: { readBy: req.session.user._id } }
  );
  res.status(200).json({
    status: "success",
  });
};

//Function for inserting new message notification in the database //Inserting new message notification in the database

function insertNewMessageNotification(chat, message) {
  chat.users.forEach(async (userId) => {
    // use to string to method to convert both of them to string otherwise they are objects and they will always return false
    if (userId.toString() === message.sender._id.toString()) return;
    else {
      await Notification.insertNotification(
        userId,
        message.sender._id,
        "newMessage",
        message.chat._id
      );
    }
  });
}
