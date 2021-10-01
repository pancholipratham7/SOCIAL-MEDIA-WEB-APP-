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
  console.log(req.params.postId);
  res.status(200).render("postPage", {
    pageTitle: "View post",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.postId,
  });
};
