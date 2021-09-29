exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.send("You cant visit this route");
  }
};
