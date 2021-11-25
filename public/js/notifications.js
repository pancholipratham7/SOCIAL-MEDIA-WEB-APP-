document.addEventListener("DOMContentLoaded", async function (e) {
  // adding event to the mark all notifications as read
  document
    .getElementById("markNotificationsAsRead")
    .addEventListener("click", async function (e) {
      const res = await axios.put("/api/notifications/markAsOpened");
      if (res.data.status === "success") {
        await markNotificationsAsOpened(null, null);
      }
    });

  const res = await axios.get("/api/notifications");
  outputNotificationList(
    res.data.notifications,
    document.querySelector(".resultsContainer")
  );
});

function outputNotificationList(notifications, container) {
  notifications.forEach((notification) => {
    var html = createNotificationHtml(notification);
    container.insertAdjacentHTML("beforeend", html);
  });

  if (notifications.length === 0) {
    container.insertAdjacentHTML(
      "afterbegin",
      '<span class="noResults">Nothing to show.</span>'
    );
  }
}
