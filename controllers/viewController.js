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
