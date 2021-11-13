const Chat = require("./../models/chatModel");

exports.createChat = async (req, res, next) => {
  if (!req.body.users) {
    return res.status(400).json({
      status: "Failed",
      message: "Users not selected",
    });
  }
  let users = req.body.users;
  users.push(req.session.user);
  if (!users.length) {
    return res.status(400).json({
      status: "failed",
      message: "Selected users array is empty",
    });
  }

  //whenever we create a group chat it will be always a group chat so that we can add more users with respect to time
  const chatData = {
    users,
    isGroupChat: true,
  };

  const chat = await Chat.create(chatData);
  res.status(200).json({
    status: "success",
    chat,
  });
};

//get chats
exports.getChats = async (req, res, next) => {
  //Loading all our chats
  const chats = await Chat.find({
    users: { $elemMatch: { $eq: req.session.user._id } },
  });
  res.status(200).json({
    status: "success",
    chats,
  });
};
