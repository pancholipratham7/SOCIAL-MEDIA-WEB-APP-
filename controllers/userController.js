const User = require("./../models/userModel");
const path = require("path");
const fs = require("fs");
const Notification = require("./../models/notificationsModel");

exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.send("You cant visit this route");
  }
};

exports.searchInputUsers = async (req, res, next) => {
  let searchObj = req.query;
  if (req.query.search !== undefined) {
    searchObj = {
      $or: [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { userName: { $regex: req.query.search, $options: "i" } },
      ],
    };
  }

  const users = await User.find(searchObj);
  res.status(200).json({
    status: "success",
    users,
  });
};

exports.follow = async (req, res, next) => {
  const user = await User.findById({ _id: req.params.userId });
  if (!user) {
    return res.status(404).json({
      status: "failed",
      data: null,
    });
  }
  if (user) {
    //checking if the user is already followed or or
    const isFollowing =
      user.followers && user.followers.includes(req.session.user._id);

    const option = isFollowing ? "$pull" : "$addToSet";
    await User.findByIdAndUpdate(
      req.params.userId,
      { [option]: { followers: req.session.user._id } },
      { new: true }
    );

    req.session.user = await User.findByIdAndUpdate(
      req.session.user._id,
      { [option]: { following: req.params.userId } },
      { new: true }
    );

    // inserting the notification in the database---- the  following notification
    if (!isFollowing) {
      await Notification.insertNotification(
        req.params.userId,
        req.session.user._id,
        "follow",
        req.session.user._id
      );
    }
  }

  res.status(200).json({
    status: "success",
    user: req.session.user,
  });
};

//get followers data
exports.getFollowers = async (req, res, next) => {
  const followers = await User.findById(req.params.userId).populate(
    "followers"
  );
  res.status(200).json({
    status: "success",
    data: followers,
  });
};

//get followers data
exports.getFollowing = async (req, res, next) => {
  const following = await User.findById(req.params.userId).populate(
    "following"
  );
  res.status(200).json({
    status: "success",
    data: following,
  });
};

//upload profile picture
exports.uploadProfilePicture = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      status: "failed",
      data: null,
    });
  }

  const filePath = `/uploads/images/${req.file.filename}.png`;
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `./../${filePath}`);

  fs.rename(tempPath, targetPath, (error) => {
    if (error != null) {
      return res.status(400).json({
        status: "failed",
        data: null,
      });
    }
  });
  req.session.user = await User.findByIdAndUpdate(
    req.session.user._id,
    {
      profilePic: filePath,
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    result: "Chup kar chutiye",
  });
};

//upload cover photo
exports.uploadCoverPhoto = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      status: "failed",
      data: null,
    });
  }

  const filePath = `/uploads/images/${req.file.filename}.png`;
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `./../${filePath}`);

  fs.rename(tempPath, targetPath, (error) => {
    if (error != null) {
      return res.status(400).json({
        status: "failed",
        data: null,
      });
    }
  });
  req.session.user = await User.findByIdAndUpdate(
    req.session.user._id,
    {
      coverPhoto: filePath,
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    result: "Chup kar chutiye",
  });
};
