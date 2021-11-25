const User = require("./../models/userModel");
const Chat = require("./../models/chatModel");
const mongoose = require("mongoose");

exports.getLoginPage = (req, res, next) => {
  res.status(200).render("login", {
    pageTitle: "Login",
  });
};
exports.getRegisterPage = (req, res, next) => {
  res.status(200).render("register", {
    pageTitle: "Register",
  });
};

exports.getHomePage = (req, res, next) => {
  res.status(200).render("home", {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  });
};

exports.getPostPage = (req, res, next) => {
  res.status(200).render("postPage", {
    pageTitle: "View post",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.postId,
  });
};

exports.getLoggedInUserProfilePage = (req, res, next) => {
  const userData = {
    pageTitle: req.session.user.userName,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };
  res.status(200).render("profilePage", userData);
};

const gettingUserProfileData = async (userName, userLoggedIn) => {
  let user = await User.findOne({ userName: userName });

  if (user == null) {
    try {
      user = await User.findById(userName);
    } catch (err) {
      return {
        pageTitle: "User not found",
        userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
      };
    }
    if (user == null) {
      return {
        pageTitle: "User not found",
        userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
      };
    }
  }

  return {
    pageTitle: user.userName,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user,
  };
};

exports.getProfilePage = async (req, res, next) => {
  const userData = await gettingUserProfileData(
    req.params.userName,
    req.session.user
  );
  res.status(200).render("profilePage", userData);
};

exports.getProfilePageWithRepliesTab = async (req, res, next) => {
  const userData = await gettingUserProfileData(
    req.params.userName,
    req.session.user
  );
  userData.selectedTab = "replies";
  res.status(200).render("profilePage", userData);
};

exports.getFollowersPage = async (req, res, next) => {
  const userData = await gettingUserProfileData(
    req.params.userName,
    req.session.user
  );
  userData.selectedTab = "followers";
  res.status(200).render("followersAndFollowing", userData);
};

exports.getFollowingPage = async (req, res, next) => {
  const userData = await gettingUserProfileData(
    req.params.userName,
    req.session.user
  );
  userData.selectedTab = "following";
  res.status(200).render("followersAndFollowing", userData);
};

//search page route
exports.getSearchPage = async (req, res, next) => {
  res.render("searchPage", {
    pageTitle: "Search",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    selectedTab: "posts",
  });
};

//selected tab on search page route
exports.searchInfoAboutSelectedTab = async (req, res, next) => {
  const selectedTab = req.params.selectedTab;
  res.render("searchPage", {
    pageTitle: "Search",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    selectedTab,
  });
};

//Messages page
exports.getAllChatsPage = async (req, res, next) => {
  res.status(200).render("inboxPage", {
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    pageTitle: "Inbox",
  });
};

//new Message page
exports.getNewChatPage = async (req, res, next) => {
  res.status(200).render("newMessage", {
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    pageTitle: "New Message",
  });
};

//messages page
exports.getMessagesPage = async (req, res, next) => {
  const userId = req.session.user._id;
  const chatId = req.params.chatId;

  //payload
  const payload = {
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    pageTitle: "Messages",
  };

  //Stack overflow validating the id whether the id represents the mongodb Id or not
  // var ObjectId = require('mongoose').Types.ObjectId;
  // ObjectId.isValid('microsoft123'); //true
  // ObjectId.isValid('timtomtamted'); //true
  // ObjectId.isValid('551137c2f9e1fac808a5f572'); //true
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    payload.errorMessage =
      "Chat doesn't exist or you don't have the permission to view it 🐱‍💻🐱‍💻🐱‍💻";
    return res.status(200).render("messagesPage", payload);
  }

  //getting the chat data because it will be helpful on the messages page
  let chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userId } },
  }).populate("users");

  if (chat === null) {
    //check if that id entered here is actually user id
    const userFound = await User.findById(chatId);
    if (userFound != null) {
      //***This is for the private chat between only two users not a group chat */
      //This chat will be accessed by the user ID while the group chats were accessed through the chat Id
      // finding the chat using the userId
      chat = await getChatByUserId(userFound._id, userId);
    }
  }

  if (chat === null) {
    payload.errorMessage =
      "Chat doesn't exist or you don't have the permission to view it 🐱‍💻🐱‍💻🐱‍💻";
  } else {
    payload.chat = chat;
  }

  payload.chatJs = JSON.stringify(chat);

  res.status(200).render("messagesPage", payload);
};

//function for getting the private chat between two users
const getChatByUserId = async (userLoggedInId, otherUserId) => {
  return await Chat.findOneAndUpdate(
    {
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [
          // If you will not use mongoose.Types.ObjectId then it will always create a new chat everytime
          //because in the database these id's will be stored as mongodb id and next time when will match the string id and mongodbId then they will not match hence it will create a new document everytime
          { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
          { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
        ],
      },
    },
    {
      $setOnInsert: {
        users: [userLoggedInId, otherUserId],
      },
    },
    {
      new: true,
      upsert: true,
    }
  ).populate("users");
};

//get the notifications page
exports.getNotificationsPage = (req, res, next) => {
  res.status(200).render("notifications", {
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    pageTitle: "Notifications",
  });
};
