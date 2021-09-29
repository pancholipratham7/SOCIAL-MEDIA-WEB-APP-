const User = require("./../models/userModel");
const bcrypt = require("bcrypt");

exports.register = async (req, res, next) => {
  try {
    const userName = req.body.userName.trim();
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const confirmPassword = req.body.confirmPassword.trim();
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();

    const payload = req.body;

    if (
      userName &&
      email &&
      password &&
      confirmPassword &&
      firstName &&
      lastName
    ) {
      //CHECKING IF USERNAME AND EMAIL ALREADY EXISTS OR NOT
      const user = await User.findOne({
        $or: [{ userName: userName }, { email: email }],
      });

      //if email or username already exists
      if (user) {
        if (email === user.email) {
          payload.errorMessage = "Email already exists.Try another one";
          res.status(400).render("register", payload);
        } else if (userName === user.userName) {
          payload.errorMessage = "Username already exists.Try another one";
          res.status(400).render("register", payload);
        }
      }

      //If user doesn't exist
      //then storing the user in the database
      let data = req.body;
      data.password = await bcrypt.hash(password, 10);
      const freshUser = new User(data);

      await freshUser.save();
      req.session.user = freshUser;
      res.redirect("/");
    } else {
      payload.errorMessage = "Make sure every field has a value.";
      res.status(400).render("register", payload);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.login = async (req, res, next) => {
  const payload = req.body;
  //Checking if userName or email and password is entered by the user or not
  if (req.body.logUserName && req.body.logPassword) {
    //Finding the user with that username or email
    const user = await User.findOne({
      $or: [
        { userName: req.body.logUserName },
        { email: req.body.logUserName },
      ],
    }).catch((err) => {
      payload.errorMessage = "Something went wrong.Please try again..!";
      return res.render("/login", payload);
    });

    //If user exists with that particular username or email
    //Checking if username or password is correct or not
    if (user) {
      const result = await bcrypt.compare(req.body.logPassword, user.password);
      if (result) {
        req.session.user = user;
        return res.redirect("/");
      } else {
        //  Wrong Password details
        payload.errorMessage = "Wrong password.Please try again.";
        return res.status(200).render("login", payload);
      }
    }

    //If user do not exist with that particular username or email
    else {
      payload.errorMessage = "Wrong username or email.Please try again.";
      return res.status(200).render("login", payload);
    }
  }
  return res.status(200).render("login", payload);
};

exports.logout = async (req, res, next) => {
  if (req.session) {
    await req.session.destroy();
    res.redirect("/login");
  }
};
