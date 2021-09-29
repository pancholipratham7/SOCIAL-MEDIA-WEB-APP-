const Post = require("./../models/postModel");
const User = require("./../models/userModel");

exports.createPost = async (req, res, next) => {
  if (req.body.content) {
    const postData = {
      content: req.body.content,
      postedBy: req.session.user._id,
      pinned: false,
    };
    let newPost = await Post.create(postData);
    newPost = await newPost.populate("postedBy");
    return res.status(200).json({
      status: "success",
      data: newPost,
    });
  }

  res.status(404).json({
    status: "failed",
    data: null,
  });
};

exports.getAllPosts = async (req, res, next) => {
  try {
    let posts = await Post.find()
      .populate("postedBy")
      .populate("retweetData")
      .sort({ createdAt: 1 });
    posts = await User.populate(posts, {
      path: "retweetData.postedBy",
    });
    res.status(200).json({
      status: "success",
      posts,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.controlPostLike = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.session.user._id;

  //Checking If the post is liked or not
  const isLiked =
    req.session.user.likes && req.session.user.likes.includes(postId);

  //option variable
  const option = isLiked ? "$pull" : "$addToSet";

  //Insert User Likes
  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { likes: postId } },
    { new: true }
  );

  //Insert Post Likes
  const post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { likes: userId } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    post,
  });
};

exports.controlRetweet = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.session.user._id;

  //Checking If the post is retweeted already or not
  //try to delete the retweeted post
  //if the retweeted Post will be present then we will be deleting it and if it is not present then we will be storing it in the post collection
  const deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  });

  // option variable
  const option = deletedPost != null ? "$pull" : "$addToSet";
  let repost = deletedPost;

  //if this post was not retweeted then we need to store this tweet as a retweeted post
  if (repost === null) {
    //creating a retweet post
    repost = await Post.create({ postedBy: userId, retweetData: postId });
  }
  //Insert User retweets
  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { retweets: repost._id } },
    { new: true }
  );

  //Updating original post retweet users
  const post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { retweetUsers: userId } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    post,
  });
};
