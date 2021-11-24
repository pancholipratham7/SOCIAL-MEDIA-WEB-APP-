const Notification = require("../models/notificationsModel");
const Post = require("./../models/postModel");
const User = require("./../models/userModel");

const getPosts = async function (filter) {
  let post = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo");
  post = await User.populate(post, {
    path: "replyTo.postedBy",
  });
  post = await User.populate(post, {
    path: "retweetData.postedBy",
  });
  return post;
};

exports.createPost = async (req, res, next) => {
  const postData = {
    content: req.body.content,
    postedBy: req.session.user._id,
  };

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

  let newPost = await Post.create(postData);
  newPost = await newPost.populate("postedBy");
  newPost = await Post.populate(newPost, { path: "replyTo" });

  //inserting the reply to Post notification in the database
  if (newPost.replyTo !== undefined) {
    await Notification.insertNotification(
      newPost.replyTo.postedBy,
      req.session.user._id,
      "reply",
      newPost._id
    );
  }

  return res.status(200).json({
    status: "success",
    data: newPost,
  });
};

exports.getPost = async (req, res, next) => {
  //first getting the post with that postId
  let postData = await getPosts({ _id: req.params.postId });
  postData = postData[0];

  //this will be the result that you will sending at the end
  let results = {
    postData,
  };

  //if it is replied post then you need to get the original post to which you have replied
  if (postData.replyTo !== undefined) {
    results.replyTo = postData.replyTo;
  }

  //all the replied post for this post
  results.replies = await getPosts({ replyTo: req.params.postId });

  res.status(200).json({
    status: "sucess",
    post: results,
  });
};

exports.getAllPosts = async (req, res, next) => {
  try {
    let searchObj = req.query;

    if (searchObj.isReply !== undefined) {
      const isReply = searchObj.isReply == "true";
      searchObj.replyTo = { $exists: isReply };
      delete searchObj.isReply;
      console.log(searchObj.replyTo);
    }

    //for searching posts with input search posts
    //i we have included so that whether we search in uppercase or lowercae it will work
    //You can make this more complex
    //we can add functionality like that ki users can search only the posts of the person they follow
    //but it's ok we are not doing here you can do it afterwords it's simple
    if (searchObj.search !== undefined) {
      searchObj.content = { $regex: searchObj.search, $options: "i" };
      delete searchObj.search;
    }

    if (searchObj.followingOnly !== undefined) {
      const followingOnly = searchObj.followingOnly == "true";
      if (followingOnly) {
        if (!req.session.user.following) {
          req.session.user.following = [];
        }
        let objectIds = [];
        req.session.user.following.forEach((user) => {
          objectIds.push(user);
        });
        objectIds.push(req.session.user._id);
        searchObj.postedBy = { $in: objectIds };
      }
      delete searchObj.followingOnly;
    }

    const posts = await getPosts(searchObj);
    // let posts = await Post.find()
    //   .populate("postedBy")
    //   .populate("retweetData")
    //   .sort({ createdAt: 1 });
    // posts = await User.populate(posts, {
    //   path: "retweetData.postedBy",
    // });
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

  //storing the like notification in the database
  if (!isLiked) {
    await Notification.insertNotification(
      post.postedBy,
      userId,
      "postLike",
      post._id
    );
  }

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

  //storing the retweet notification in the database

  if (!deletedPost) {
    await Notification.insertNotification(
      post.postedBy,
      req.session.user._id,
      "retweet",
      post._id
    );
  }

  res.status(200).json({
    status: "success",
    post,
  });
};

exports.deletePost = async (req, res, next) => {
  try {
    await Post.findByIdAndDelete({ _id: req.params.postId });
    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      err,
    });
  }
};

//function for pinning and unpinning post
exports.pinPost = async (req, res, next) => {
  // console.log(req.params.postId);
  // console.log(req.body.pinned);

  //firstly unpinning all the post
  if (req.body.pinned !== undefined) {
    await Post.updateMany({ postedBy: req.session.user }, { pinned: false });
  }
  await Post.findByIdAndUpdate({ _id: req.params.postId }, req.body);
  res.status(200).json({
    status: "success",
  });
};
