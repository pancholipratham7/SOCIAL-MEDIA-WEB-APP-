const express = require("express");
const pug = require("pug");
const path = require("path");
const mongoose = require("./database.js");
const session = require("express-session");

//routers
const viewRouter = require("./routes/viewRoutes");
const postRouter = require("./routes/postApiRoutes");
const userRouter = require("./routes/userApiRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const chatRouter=require('./routes/chatApiRoutes');
const messagesRouter=require('./routes/messagesApiRoutes');



const app = express();

//setting the templating engine
app.set("views", "./views");
app.set("view engine", "pug");

//Setting the server
app.listen(process.env.PORT, () => {
  console.log("Server Started");
});

//session middleware
app.use(
  session({
    secret: "cr7 is the goat",
    resave: true,
    saveUninitialized: false,
  })
);

//parsing the incoming data into  req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//serving the static files
app.use(express.static(path.join(__dirname, "public")));

app.use("/uploads", uploadRouter);
app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);
app.use("/api/chats",chatRouter);
app.use("/api/messages",messagesRouter);


app.use("/", viewRouter);
