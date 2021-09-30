const mongoose = require("mongoose");

//Defining post schema
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pinned: Boolean,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    retweetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    retweetData: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

//Post Model
const Post = new mongoose.model("Post", postSchema);

module.exports = Post;
