const Chat = require("../models/chatModel");
const Message = require("./../models/messageModel");

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
      console.log(message);

      //If the message is successfully stored then we need to updated the chat latest message with this message
      Chat.findByIdAndUpdate(req.body.chat, { latestMessage: message }).catch(
        (err) => {
          console.log(err);
        }
      );

      res.status(200).json({
        status: "success",
        message,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        status: "failed",
        error: "Could not send the message",
      });
    });
};
