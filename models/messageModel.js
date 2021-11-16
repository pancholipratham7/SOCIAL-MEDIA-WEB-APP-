const mongoose = require("mongoose");

//Defining post schema
const messageSchema = new mongoose.Schema(
  {
    content: { type: String, trim: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  },
  { timestamps: true }
);

//Post Model
const Message = new mongoose.model("Message", messageSchema);

module.exports = Message;
