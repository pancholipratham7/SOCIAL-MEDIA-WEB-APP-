let connected = false;
const socket = io("http://localhost:3000");

socket.emit("setup", userLoggedIn);

socket.on("connected", () => {
  connected = true;
});

//we are adding this here because when you will revieve this event you can be either on the home page or chat page or anywhere else
//new message notification socket io
socket.on("message received", (newMessage) => {
  messageReceived(newMessage);
});

//NOTIFICATION EVENTS
socket.on("notification received", async (newNotification) => {
  const res = await axios.get("/api/notifications/latest");
  refreshNotificationsBadge();
  showNotificationPopup(res.data.notification);
});

//function for emitting notification
function emitNotification(userId) {
  //the user id will be basically the user to whom you want to send the notification
  if (userId === userLoggedIn._id) {
    return;
  }
  socket.emit("notification received", userId);
}
