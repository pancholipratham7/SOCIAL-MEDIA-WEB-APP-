//function for refreshing the message Badge
const refreshMessagesBadge = () => {
  axios.get("/api/chats", { params: { unreadOnly: true } }).then((results) => {
    const messageNotificationsNo = results.data.chats.length;
    if (messageNotificationsNo === null || messageNotificationsNo === 0) {
      document.getElementById("messagesBadge").classList.remove("active");
    } else {
      document.getElementById("messagesBadge").textContent =
        messageNotificationsNo;
      document.getElementById("messagesBadge").classList.add("active");
    }
  });
};
