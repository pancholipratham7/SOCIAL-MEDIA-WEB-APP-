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

function createNotificationHtml(notification) {
  const text = getNotificationText(notification);
  const url = getNotificationUrl(notification);
  const className = notification.opened ? "" : "notificationActive";
  return `<a href="${url}" class="resultListItem notification ${className}" data-id=${notification._id}><div class="resultsImageContainer"><img src=${notification.userFrom.profilePic}></div><div class="resultsDetailsContainer ellipsis"><span class="ellipsis">${text}</span></div></a>`;
}

//generating the notification text
function getNotificationText(notification) {
  const userFrom = notification.userFrom;
  if (!userFrom.firstName || !userFrom.lastName) {
    return alert("userFrom not populated");
  }

  let text = "";

  const userFromName = `${userFrom.firstName} ${userFrom.lastName}`;

  if (notification.notificationType === "retweet") {
    text = `${userFromName} retweeted one of your posts`;
  } else if (notification.notificationType === "postLike") {
    text = `${userFromName} liked one of your posts`;
  } else if (notification.notificationType === "reply") {
    text = `${userFromName} replied to one of your posts`;
  } else if (notification.notificationType === "follow") {
    text = `${userFromName} started following you`;
  }
  return `<span class="ellipsis">${text}</span>`;
}

//generating the notification URl
function getNotificationUrl(notification) {
  let url = "";

  if (
    notification.notificationType === "retweet" ||
    notification.notificationType === "postLike" ||
    notification.notificationType === "reply"
  ) {
    url = `/post/${notification.entityId}`;
  } else if (notification.notificationType === "follow") {
    url = `/profile/${notification.entityId}`;
  }
  return url;
}

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
