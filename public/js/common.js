//Global Variables
let cropper;
let timer;
let selectedUsers = [];

// GETTING THE MESSAGE NOTIIFICATIONS
document.addEventListener("DOMContentLoaded", function (e) {
  refreshMessagesBadge();
  refreshNotificationsBadge();
});

// function for refreshing notifications Badge
const refreshNotificationsBadge = () => {
  axios
    .get("/api/notifications", { params: { unreadOnly: true } })
    .then((results) => {
      const notificationsNo = results.data.notifications.length;
      if (notificationsNo > 0) {
        document.getElementById("notificationsBadge").textContent =
          notificationsNo;
        document.getElementById("notificationsBadge").classList.add("active");
      } else {
        document
          .getElementById("notificationsBadge")
          .classList.remove("active");
      }
    });
};

//Adding text area
if (document.querySelector(".tweetPost")) {
  document
    .querySelector(".tweetPost")
    .insertAdjacentHTML(
      "afterbegin",
      `<textarea id="postTextArea" placeholder="What's happening?"></textarea>`
    );
}

//Post html generator function
function createPostHtml(postData, largeFont = false) {
  //Just if some error occurs
  //Only for development purpose
  if (postData === null)
    return alert("PostData object is null in createpostHtml function");
  //Checking if the postData is about a retweet
  const isRetweet = postData.retweetData ? true : false;

  //largeFont class for the post which was clicked to show it somewhat bigger on the post page
  const largeFontClass = largeFont ? "largeFont" : "";

  //Finding the retweetedBy username
  const retweetedBy = isRetweet ? postData.postedBy.userName : null;
  postData = isRetweet ? postData.retweetData : postData;

  const postedBy = postData.postedBy;
  if (!postedBy._id) return console.log("PostedbY property not populated");
  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const timestamps = timeDifference(new Date(), new Date(postData.createdAt));

  const retweetBtnActiveClass = postData.retweetUsers.includes(userLoggedIn._id)
    ? "active"
    : "";
  const likeBtnActiveClass = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";

  let retweetText = "";
  if (isRetweet) {
    retweetText = `<span>
    <i class="fas fa-retweet"></i>
    Retweeted by <a href="/profile/${retweetedBy}">@${retweetedBy}</a>
    </span>`;
  }

  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return alert("Reply to field id not present");
    } else if (!postData.replyTo.postedBy._id) {
      return alert("PostedBy is not populated");
    }

    const replyToUsername = postData.replyTo.postedBy.userName;
    replyFlag = `<div class="replyFlag">Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a></div>`;
  }

  let deleteButton = "";
  let pinPostButton = "";
  let pinnedPostText = "";
  if (postData.postedBy._id === userLoggedIn._id) {
    let pinnedClass = "";
    let dataTarget = "#pinPostModal";
    if (postData.pinned === true) {
      pinnedClass = "active";
      dataTarget = "#unpinModal";
      pinnedPostText =
        "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
    }
    deleteButton = `<button class='deletePostBtn' data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-trash-alt"></i></button>`;
    pinPostButton = `<button  class='pinPostButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target=${dataTarget}><i class="fas fa-thumbtack"></i></button>`;
  }

  return `<div class='post ${largeFontClass}' data-id=${postData._id}>
            <div class="postActionContainer">
            ${retweetText}
            </div>
            <div class="mainContentContainer">
              <div class="userImageContainer">
                <img src=${postedBy.profilePic}>
              </div>
              <div class="postContentContainer">
                <div class='pinnedPostText'>${pinnedPostText}</div>
                <div class="header">
                  <a href="/profile/${
                    postedBy.userName
                  }" class="displayName">${displayName}</a>
                  <span class="username">@${postedBy.userName}</span>
                  <span class="date">${timestamps}</span>
                  ${pinPostButton}
                  ${deleteButton}
                </div>
                ${replyFlag}
                <div class="postBody">
                  <span>${postData.content}</span>
                </div>
                <div class="postFooter">
                  <div class="postButtonContainer">
                    <button class="replyButton" data-toggle='modal' data-target='#replyModal'>
                      <i class="far fa-comment"></i>
                    </button>
                  </div>  
                  <div class="postButtonContainer green">
                    <button class="retweetButton ${retweetBtnActiveClass} ">
                      <i class="fas fa-retweet"></i>
                      <span class="retweetsNumber">${
                        postData.retweetUsers.length === 0
                          ? ""
                          : postData.retweetUsers.length
                      }</span>
                    </button>
                  </div>
                  <div class="postButtonContainer red">
                    <button class="likeButton ${likeBtnActiveClass}">
                      <i class="far fa-heart"></i>
                      <span class="likesLength">${
                        postData.likes.length === 0 ? "" : postData.likes.length
                      }</span>
                    </button>
                  </div>  
                </div>
              </div>
            </div>
          </div>`;
}

//Disabling and enabling submit post button and replyText submit button
[
  document.getElementById("postTextArea"),
  document.getElementById("replyTextArea"),
].forEach((item) => {
  if (!item) return;
  item.addEventListener("keyup", function (e) {
    const isModal = e.target.closest(".modal");
    const textValue = e.target.value.trim();
    if (textValue === "") {
      if (isModal) {
        document.getElementById("submitReplyButton").disabled = true;
      } else document.getElementById("submitPostButton").disabled = true;
    } else {
      if (isModal) {
        document
          .getElementById("submitReplyButton")
          .removeAttribute("disabled");
      } else
        document.getElementById("submitPostButton").removeAttribute("disabled");
    }
  });
});

//This event only can be handled using jquery not with vanilla js
//show.bs.modal event is provided by bootstrap
//this event will be triggered when modal will open
$("#replyModal").on("show.bs.modal", async function (e) {
  const postId = e.relatedTarget.closest(".post").dataset.id;
  let postData = await fetch(`/api/posts/${postId}`);
  postData = await postData.json();
  document.getElementById("submitReplyButton").dataset.id = postId;
  outputPosts(
    postData.post.postData,
    document.querySelector("#originalPostContainer")
  );
});

//this event will be teriggered when the modal will be closed
$("#replyModal").on("hidden.bs.modal", async function (e) {
  document.querySelector("#originalPostContainer").innerHTML = "";
});

//getting the post id after clicking on the delete icon
$("#deletePostModal").on("show.bs.modal", async function (e) {
  const postId = e.relatedTarget.dataset.id;
  document.getElementById("deletePostButton").dataset.id = postId;
});

//ADDING EVENT TO DELETE POST BUTTON
if (document.getElementById("deletePostButton")) {
  document
    .getElementById("deletePostButton")
    .addEventListener("click", async function (e) {
      const postId = e.target.dataset.id;
      let res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      res = await res.json();
      if (res.status === "success") {
        location.reload(true);
      } else if (res.status === "failed") {
        alert(res.err);
      }
    });
}
// adding event to submit and reply post btn
const submitPostBtn = document.getElementById("submitPostButton");
const replyPostBtn = document.getElementById("submitReplyButton");
[submitPostBtn, replyPostBtn].forEach((item) => {
  if (!item) return;
  item.addEventListener("click", async function (e) {
    e.preventDefault();
    const isModal = e.target.closest(".modal");
    let textArea = isModal
      ? document.getElementById("replyTextArea")
      : document.getElementById("postTextArea");

    const post = textArea.value;
    const postData = {
      content: post,
    };

    if (isModal) {
      const id = document.getElementById("submitReplyButton").dataset.id;
      if (id === null) {
        return alert("Button Id is null");
      }
      postData.replyTo = id;
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify(postData),
      headers: { "Content-type": "application/json;charset=UTF-8" },
    });
    const result = await res.json();
    if (!result.data) {
      alert("Something went Wrong...!");
    } else {
      if (document.querySelector(".noResults")) {
        document.querySelector(".noResults").remove();
      }
      if (isModal) {
        emitNotification(result.data.replyTo.postedBy);
        return location.reload(true);
      }
      const html = createPostHtml(result.data);
      document
        .querySelector(".postsContainer")
        .insertAdjacentHTML("afterbegin", html);
      textArea.value = "";
      document.getElementById("submitPostButton").disabled = true;
      document.getElementById("submitReplyButton").disabled = true;
    }
  });
});

//event handler for posts to redirect users to post page
document.addEventListener("click", function (e) {
  if (!e.target.closest("button")) {
    if (!e.target.closest(".displayName")) {
      if (e.target.closest(".post")) {
        const postId = e.target.closest(".post").dataset.id;
        window.location.href = `/post/${postId}`;
      }
    }
  }
});

//Adding event handler to the like button
document.addEventListener("click", async function (e) {
  const likeBtn = e.target.closest(".likeButton");
  if (likeBtn) {
    if (likeBtn.closest(".post")) {
      const postId = likeBtn.closest(".post").dataset.id;
      let res = await fetch(`/api/posts/${postId}/like`, {
        method: "PUT",
      });
      res = await res.json();
      if (res.post.likes.length) {
        likeBtn.lastElementChild.textContent = res.post.likes.length;
      } else {
        likeBtn.lastElementChild.textContent = "";
      }
      if (res.post.likes.includes(userLoggedIn._id)) {
        likeBtn.classList.add("active");
        emitNotification(res.post.postedBy);
      } else {
        likeBtn.classList.remove("active");
      }
    }
  }
});

//Adding event handler to the retweet button
document.addEventListener("click", async function (e) {
  const retweetBtn = e.target.closest(".retweetButton");
  if (retweetBtn) {
    if (retweetBtn.closest(".post")) {
      const postId = retweetBtn.closest(".post").dataset.id;
      let res = await fetch(`/api/posts/${postId}/retweet`, {
        method: "POST",
      });
      res = await res.json();

      if (res.post.retweetUsers.length) {
        retweetBtn.lastElementChild.textContent = res.post.retweetUsers.length;
      } else {
        retweetBtn.lastElementChild.textContent = "";
      }
      if (res.post.retweetUsers.includes(userLoggedIn._id)) {
        retweetBtn.classList.add("active");
        emitNotification(res.post.postedBy);
      } else {
        retweetBtn.classList.remove("active");
      }
    }
  }
});

//addingEvent to the follow btn
document.addEventListener("click", async function (e) {
  if (e.target.closest(".followBtn")) {
    const followBtn = e.target.closest(".followBtn");
    const userId = followBtn.dataset.userid;
    let userData = await fetch(`/api/users/${userId}/follow`, {
      method: "PUT",
    });
    userData = await userData.json();
    if (userData.user.following.includes(userId)) {
      followBtn.classList.add("following");
      followBtn.textContent = "Following";
      if (document.querySelector(".followersValue")) {
        let followersValue =
          +document.querySelector(".followersValue").textContent;
        document.querySelector(".followersValue").textContent = `${
          followersValue + 1
        }`;
      }

      emitNotification(userId);
    } else {
      followBtn.classList.remove("following");
      followBtn.textContent = "Follow";
      if (document.querySelector(".followersValue")) {
        let followersValue =
          +document.querySelector(".followersValue").textContent;
        document.querySelector(".followersValue").textContent = `${
          followersValue - 1
        }`;
      }
    }
  } else return;
});

//event for showing image on the modal before uploading it
//here the user will be uploading the files from his computer so you can't provide the path
//Without specifying the image path you can also embed image in an html document in a special format called as data URL
//so first we need to read the image file as data url and then after reading it we need to embed in the image src attrib

if (document.getElementById("filePhoto")) {
  document
    .getElementById("filePhoto")
    .addEventListener("change", function (event) {
      if (this.files && this.files[0]) {
        //Javascript inbuilt file reader api
        let reader = new FileReader();
        reader.addEventListener("load", function (e) {
          document
            .getElementById("imagePreview")
            .setAttribute("src", e.target.result);
          //if already the cropper is present then we need to destroy it....
          if (cropper !== undefined) {
            cropper.destroy();
          }
          cropper = new Cropper(document.getElementById("imagePreview"), {
            aspectRatio: 1 / 1,
            background: false,
          });
        });
        reader.readAsDataURL(this.files[0]);
      }
    });
}

//event for showing cover Photo on the modal before uploading it

if (document.getElementById("coverPhoto")) {
  document
    .getElementById("coverPhoto")
    .addEventListener("change", function (event) {
      if (this.files && this.files[0]) {
        //Javascript inbuilt file reader api
        let reader = new FileReader();
        reader.addEventListener("load", function (e) {
          document
            .getElementById("coverPreview")
            .setAttribute("src", e.target.result);
          //if already the cropper is present then we need to destroy it....
          if (cropper !== undefined) {
            cropper.destroy();
          }
          cropper = new Cropper(document.getElementById("coverPreview"), {
            aspectRatio: 16 / 9,
            background: false,
          });
        });
        reader.readAsDataURL(this.files[0]);
      }
    });
}

//Adding event to the image upload button
if (document.getElementById("imageUploadButton")) {
  document
    .getElementById("imageUploadButton")
    .addEventListener("click", function (event) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas == null) {
        alert("Error while uploading the image.Only upload image files....!");
        return location.reload(true);
      }
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("croppedImage", blob);
        const res = await axios({
          method: "POST",
          url: "/api/users/profilePicture",
          headers: { "Content-Type": "multipart/form-data" },
          data: formData,
        });
        if (res.data.status === "failed") {
          alert("Error occured while uploading the image.Please try again");
          return location.reload(true);
        } else {
          location.reload(true);
        }
      });
    });
}

//Adding event to the cover Photo  upload button
if (document.getElementById("coverPhotoUploadButton")) {
  document
    .getElementById("coverPhotoUploadButton")
    .addEventListener("click", function (event) {
      const canvas = cropper.getCroppedCanvas({
        minWidth: 256,
        minHeight: 256,
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: "#fff",
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });
      if (canvas == null) {
        alert("Error while uploading the image.Only upload image files....!");
        return location.reload(true);
      }
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("croppedImage", blob);
        const res = await axios({
          method: "POST",
          url: "/api/users/coverPhoto",
          headers: { "Content-Type": "multipart/form-data" },
          data: formData,
        });
        if (res.data.status === "failed") {
          alert("Error occured while uploading the image.Please try again");
          return location.reload(true);
        } else {
          location.reload(true);
        }
      });
    });
}

//Listening to the opening of pin Modal event
$("#pinPostModal").on("show.bs.modal", function (e) {
  const postId = e.relatedTarget.dataset.id;
  document.getElementById("pinPostButton").dataset.postId = postId;
});

//Listening to the opening of unpin Modal event
$("#unpinModal").on("show.bs.modal", function (e) {
  const postId = e.relatedTarget.dataset.id;
  document.getElementById("unpinPostButton").dataset.postId = postId;
});

//Adding event to the Pin button
document.addEventListener("click", async function (e) {
  if (e.target === document.getElementById("pinPostButton")) {
    //updating the pinned attribute in the database
    const res = await axios({
      method: "PUT",
      url: `/api/posts/${e.target.dataset.postId}/pin`,
      data: {
        pinned: true,
      },
    });
    if (res.data.status === "success") {
      location.reload();
    }
  } else if (e.target === document.getElementById("unpinPostButton")) {
    //unpinng the post making the call to the backend
    const res = await axios({
      method: "PUT",
      url: `/api/posts/${e.target.dataset.postId}/pin`,
      data: {
        pinned: false,
      },
    });
    if (res.data.status === "success") {
      location.reload();
    }
  }
});

// // timer for searching users for chatting
if (document.getElementById("userSearchTextBox")) {
  document
    .getElementById("userSearchTextBox")
    .addEventListener("keydown", function (event) {
      clearTimeout(timer);
      const textBox = document.getElementById("userSearchTextBox");
      const value = textBox.value;

      //If the user presses the backspace key we want to delete the user selected for the chat option
      if (value == "" && event.key === "Backspace") {
        //Clearing the pervious user
        const removedUser = selectedUsers.pop();
        showSelectedUsers();
        document.querySelector(".resultsContainer").textContent = "";
        if (selectedUsers.length === 0) {
          document
            .getElementById("createChatButton")
            .setAttribute("disabled", true);
        }
        return;
      }
      timer = setTimeout(() => {
        if (value.trim() === "") {
          document.querySelector(".resultsContainer").textContent = "";
        } else {
          searchUsers(value);
        }
      }, 1000);
    });
}

//function for searching users during the chat options
async function searchUsers(value) {
  const res = await axios.get("/api/users", {
    params: {
      search: value,
    },
  });
  outputSelectableUsers(
    res.data.users,
    document.querySelector(".resultsContainer")
  );
}

//FUNCTION FOR OUTPUTTING selectable SEARCHED USERS
function outputSelectableUsers(results, container) {
  container.innerHTML = "";
  if (results.length === 0) {
    container.insertAdjacentHTML(
      "afterbegin",
      "<span class='noResults'>No results found</span>"
    );
    return;
  }
  results.forEach((result) => {
    //NOT OUTPUTTING OURSELF
    if (
      result._id === userLoggedIn._id ||
      selectedUsers.some((user) => user._id === result._id)
    ) {
      return;
    }
    const html = createUserHtml(result, false);
    let element = document.createElement("div");
    element.classList.add("user");
    element.innerHTML = html;

    // adding event for selcting the searched users for chatting
    element.addEventListener("click", function (e) {
      usersSelected(result);
    });

    container.appendChild(element);
    // container.insertAdjacentHTML("afterbegin", html);
  });
}

// usersSelected function for handling the click at the user you want to select
function usersSelected(user) {
  selectedUsers.push(user);
  showSelectedUsers();
  document.getElementById("userSearchTextBox").value = "";
  document.getElementById("userSearchTextBox").focus();
  document.querySelector(".resultsContainer").textContent = "";
  document.getElementById("createChatButton").removeAttribute("disabled");
}

function showSelectedUsers() {
  let selectedUsersHtml = "";
  selectedUsers.forEach((user) => {
    const name = user.firstName + " " + user.lastName;
    selectedUsersHtml =
      selectedUsersHtml + `<span class='selectedUser'>${name}</span>`;
  });
  document.querySelectorAll(".selectedUser").forEach((el) => el.remove());
  document
    .getElementById("selectedUsers")
    .insertAdjacentHTML("afterbegin", selectedUsersHtml);
}

//CHAT SECTION
//Adding event to the creat Chat button
document.addEventListener("click", async function (e) {
  if (e.target === document.getElementById("createChatButton")) {
    const res = await axios.post("/api/chats", {
      users: selectedUsers,
    });

    const chat = res.data.chat;
    if (!chat || !chat._id) {
      return alert("Invalid respone from server");
    }
    location.replace(`/messages/${chat._id}`);
  }
});

//getting the chatName
//If we have not given our choice on selecting name for the group chat then by default the group chat will be set to all the user's Name
function getChatName(chatData) {
  let chatName = chatData.chatName;
  if (!chatName) {
    const otherChatUsers = getOtherChatUsers(chatData.users);
    let namesArray = otherChatUsers.map(
      (user) => user.firstName + " " + user.lastName
    );
    chatName = namesArray.join(", ");
  }

  return chatName;
}

function getOtherChatUsers(users) {
  if (users.length === 1) {
    return users;
  }
  return users.filter((user) => user._id !== userLoggedIn._id);
}

//StackOverflow
//Changing time recieved from database to twitter standard time format
function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just now";

    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    if (Math.round(elapsed / msPerDay) == 1) {
      return Math.round(elapsed / msPerDay) + " day ago";
    } else return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

//outpost post function
function outputPosts(posts, container) {
  container.innerHTML = "";

  //if posts is not an array then changing it into an array
  if (!Array.isArray(posts)) {
    posts = [posts];
  }
  posts.forEach((post) => {
    const html = createPostHtml(post);

    container.insertAdjacentHTML("afterbegin", html);
  });
  if (posts.length === 0) {
    container.insertAdjacentHTML(
      "afterbegin",
      '<span class="noResults">Nothing to show.</span>'
    );
  }
}

//outpost posts and replies on post page
function outputPostsWithReplies(results, container) {
  container.innerHTML = "";

  //first displaying original post
  if (results.replyTo && results.replyTo._id) {
    const mainPostHtml = createPostHtml(results.replyTo);
    container.insertAdjacentHTML("afterbegin", mainPostHtml);
  }

  //displaying the post which was clicked
  const html = createPostHtml(results.postData, true);
  container.insertAdjacentHTML("beforeend", html);

  results.replies.forEach((post) => {
    const html = createPostHtml(post);
    container.insertAdjacentHTML("beforeend", html);
  });
}

//FUNCTION FOR OUTPUTTING SEARCHED USERS
function outputUsers(results, container) {
  container.innerHTML = "";
  if (results.length === 0) {
    container.insertAdjacentHTML(
      "afterbegin",
      "<span class='noResults'>No results found</span>"
    );
    return;
  }
  results.forEach((result) => {
    const html = createUserHtml(result, true);
    const element = document.createElement("div");
    element.classList.add("user");
    element.innerHTML = html;
    container.appendChild(element);
  });
}

function createUserHtml(userData, showFollowButton) {
  const name = `${userData.firstName} ${userData.lastName}`;
  let htmlFollowButton = "";
  const isFollowing =
    userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  const btnText = isFollowing ? "Following" : "Follow";
  const buttonClass = isFollowing ? "followBtn following" : "followBtn";

  if (showFollowButton && userLoggedIn._id != userData._id) {
    htmlFollowButton = `<div class="followButtonContainer">
                              <button class='${buttonClass}' data-userid=${userData._id}>${btnText}</button>
                          </div>`;
  }

  return `<div class='userImageContainer'>
            <img src='${userData.profilePic}'>
          </div>
            <div class='userDetailsContainer'>
              <div class='header'>
                <a href='/profile/${userData.userName}'>${name}</a>
                <span class='username'>@${userData.userName}</span>
              </div>
            </div>
            ${htmlFollowButton}`;
}

// function for marking notification as read
const markNotificationsAsOpened = async (
  notificationId = null,
  callback = null
) => {
  if (callback === null)
    callback = () => {
      location.reload();
    };

  const url =
    notificationId != null
      ? `/api/notifications/${notificationId}/markAsOpened`
      : `/api/notifications/markAsOpened`;

  const res = await axios.put(url);
  if (res.data.status === "success") {
    callback();
  }
};

// adding event to the unopened notification
document.addEventListener("click", async function (e) {
  if (e.target.closest(".notificationActive")) {
    e.preventDefault();
    const notificationId = document.querySelector(".notificationActive").dataset
      .id;
    const href = e.target.closest(".notificationActive").getAttribute("href");
    const callback = () => {
      window.location = href;
    };
    await markNotificationsAsOpened(notificationId, callback);
  }
});

//NOTIFICATION HTML CREATION

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
  return `${text}`;
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

//showing notification popup
function showNotificationPopup(data) {
  const html = createNotificationHtml(data);
  const container = document.getElementById("notificationList");
  container.insertAdjacentHTML("afterbegin", html);
  setTimeout(() => {
    document.querySelector(".notification").style.display = "none";
  }, 5000);
}

//showing message notification popup
function showMessageNotificationPopup(data) {
  if (!data.chat.latestMessage._id) {
    data.chat.latestMessage = data;
  }
  const html = createChatHtml(data.chat, "messageNotification");
  const container = document.getElementById("notificationList");
  container.insertAdjacentHTML("afterbegin", html);
  setTimeout(() => {
    document.querySelector(".messageNotification").style.display = "none";
  }, 5000);
}

// function for message received
function messageReceived(newMessage) {
  if (
    document.querySelector(".chatContainer") === null ||
    document.querySelector(".chatContainer").dataset.room !==
      newMessage.chat._id
  ) {
    //showing popup notification
    showMessageNotificationPopup(newMessage);
  } else {
    markAllMessages2AsRead();
    addChatMessageHtml(newMessage);
    scrollToBottom();
  }
  refreshMessagesBadge();
}

//function for refreshing the message Badge
const refreshMessagesBadge = () => {
  axios
    .get("/api/chats", { params: { unreadOnly: "true" } })
    .then((results) => {
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

function createChatHtml(chatData, messageNotification = "") {
  const chatName = getChatName(chatData);
  const latestMessage = getLatestMessage(chatData.latestMessage);
  const image = getChatImageElements(chatData);

  //background color for unread chats should be blue
  const activeClass =
    !chatData.latestMessage ||
    chatData.latestMessage.readBy.includes(userLoggedIn._id)
      ? ""
      : "active";

  return `<a href='/messages/${chatData._id}' class="resultListItem ${messageNotification} ${activeClass}">
            ${image}
            <div class='resultsDetailsContainer ellipsis'>
                <span class='heading ellipsis'>${chatName}</span>
                <span class='subtext ellipsis'>${latestMessage}</span>
            </div>
    </a>`;
}

//getting the chat latest message
function getLatestMessage(latestMessage) {
  if (latestMessage) {
    return `${latestMessage.sender.firstName} ${latestMessage.sender.lastName}: ${latestMessage.content}`;
  }
  return "New Chat";
}

//getting the chatName
//If we have not given our choice on selecting name for the group chat then by default the group chat will be set to all the user's Name
function getChatName(chatData) {
  let chatName = chatData.chatName;
  if (!chatName) {
    const otherChatUsers = getOtherChatUsers(chatData.users);
    let namesArray = otherChatUsers.map(
      (user) => user.firstName + " " + user.lastName
    );
    chatName = namesArray.join(", ");
  }

  return chatName;
}

function getOtherChatUsers(users) {
  if (users.length === 1) {
    return users;
  }
  return users.filter((user) => user._id !== userLoggedIn._id);
}

//Get chat image elements
function getChatImageElements(chatData) {
  const otherUsers = getOtherChatUsers(chatData.users);
  let groupChatClass = "";
  let chatImage = getUserChatImageElement(otherUsers[0]);
  if (otherUsers.length > 1) {
    groupChatClass = "groupChatImage";
    chatImage = chatImage + getUserChatImageElement(otherUsers[1]);
  }
  return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
  if (!user || !user.profilePic) {
    return alert("User passed in the function is invalid");
  }
  return `<img src=${user.profilePic} alt="User's profile picture">`;
}

//scrolling to the bottom page
function scrollToBottom() {
  const container = document.querySelector(".chatMessages");
  const scrollHeight = container.scrollHeight;

  container.scrollTop = scrollHeight;
}

// function for adding sent message  on the message page
function addChatMessageHtml(message, nextMessage, lastSenderId) {
  if (!message || !message._id) {
    return alert("Message is not valid");
  }
  const messageDiv = createMessageHtml(message, nextMessage, lastSenderId);
  addMessagesHtmlToPage(messageDiv);
}

//creating the messageHtml
function createMessageHtml(message, nextMessage, lastSenderId) {
  const sender = message.sender;
  const senderName = `${sender.firstName} ${sender.lastName}`;
  const currentSenderId = sender._id;
  const nextSenderId = nextMessage != null ? nextMessage.sender._id : "";
  const isFirst = lastSenderId != currentSenderId;
  const isLast = nextSenderId != currentSenderId;

  const isMine = message.sender._id === userLoggedIn._id;
  let liClassName = isMine ? "mine" : "theirs";
  let senderNameElement = "";

  if (isFirst) {
    liClassName += " first";
    if (!isMine) {
      senderNameElement = `<span class="senderName">${senderName}</span>`;
    }
  }

  let profileImageMessageElement = "";

  if (isLast) {
    liClassName += " last";
    profileImageMessageElement = `<img src="${sender.profilePic}">`;
  }

  let messageImageContainer = "";
  if (!isMine) {
    messageImageContainer = `<div class="imageContainer">
                                  ${profileImageMessageElement}
                               </div>`;
  }

  return `<li class='message ${liClassName}'>
              ${messageImageContainer}
              <div class='messageContainer'>
                  ${senderNameElement}
                  <span class='messageBody'>
                    ${message.content}
                  </span>
              </div>
             </li>`;
}

// adding messages Html to the page
function addMessagesHtmlToPage(messageDiv) {
  document
    .querySelector(".chatMessages")
    .insertAdjacentHTML("beforeend", messageDiv);

  // scroll to bottom
}

//FUNCTION FOR MARKING ALL MESSAGES AS READ
async function markAllMessages2AsRead() {
  const res = await axios.put(`/api/messages/${chatId}/markAllMessagesAsRead`);
  refreshMessagesBadge();
}
