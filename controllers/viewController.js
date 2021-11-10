const User = require("./../models/userModel");
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
  console.log(selectedTab);
  res.render("searchPage", {
    pageTitle: "Search",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    selectedTab,
  });
};
