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
const chatRouter = require("./routes/chatApiRoutes");
const messagesRouter = require("./routes/messagesApiRoutes");

const app = express();

//Setting the server
const server = app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
const io = require("socket.io")(server, { pingeTimeout: 60000 });

//setting the templating engine
app.set("views", "./views");
app.set("view engine", "pug");

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
app.use("/api/chats", chatRouter);
app.use("/api/messages", messagesRouter);

app.use("/", viewRouter);

///Setting up the io connection (real time connection)

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    //JOINING A ROOM
    socket.join(userData._id);
    socket.emit("connected");
  });

  //this for joining the chat room
  socket.on("join room", (room) => {
    console.log(room);
    socket.join(room);
  });

  //handling the typing event
  socket.on("typing", (typingData) => {
    console.log(typingData);
    socket
      .in(typingData.chatId)
      .emit("typing", { user: typingData.user.firstName });
  });

  // stopping typing indicator
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });
});
