//Global Variables
let cropper;
let timer;

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
      console.log(postData.replyTo);
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
  console.log(document.getElementById("deletePostButton").dataset.id);
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
        console.log(res.err);
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
    console.log(1);
    if (likeBtn.closest(".post")) {
      const postId = likeBtn.closest(".post").dataset.id;
      let res = await fetch(`/api/posts/${postId}/like`, {
        method: "PUT",
      });
      console.log(likeBtn.lastElementChild);
      res = await res.json();
      if (res.post.likes.length) {
        likeBtn.lastElementChild.textContent = res.post.likes.length;
      } else {
        likeBtn.lastElementChild.textContent = "";
      }
      if (res.post.likes.includes(userLoggedIn._id)) {
        likeBtn.classList.add("active");
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
      // console.log(retweetBtn.lastElementChild);
      res = await res.json();
      console.log(res.post.retweetUsers.length);

      if (res.post.retweetUsers.length) {
        retweetBtn.lastElementChild.textContent = res.post.retweetUsers.length;
      } else {
        retweetBtn.lastElementChild.textContent = "";
      }
      if (res.post.retweetUsers.includes(userLoggedIn._id)) {
        retweetBtn.classList.add("active");
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
    console.log(userId);
    let userData = await fetch(`/api/users/${userId}/follow`, {
      method: "PUT",
    });
    userData = await userData.json();
    console.log(userData.user);
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
  // console.log(e.relatedTarget);
  const postId = e.relatedTarget.dataset.id;
  document.getElementById("pinPostButton").dataset.postId = postId;
});

//Listening to the opening of unpin Modal event
$("#unpinModal").on("show.bs.modal", function (e) {
  // console.log(e.relatedTarget);
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
    console.log(res.data);
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

// timer for searching users for chatting
if (document.getElementById("userSearchTextBox")) {
  document
    .getElementById("userSearchTextBox")
    .addEventListener("keydown", function (event) {
      clearTimeout(timer);
      const textBox = event.target;
      const value = textBox.value;
      //If the user presses the backspace key we want to delete the user selected for the chat option
      if (value == "" && event.key === "Backspace") {
        //Clearing the pervious user
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
    if (result._id === userLoggedIn._id) {
      return;
    }
    const html = createUserHtml(result, true);
    let element = document.createElement("div");
    element.classList.add("user");
    element.innerHTML = html;
    container.appendChild(element);
    // container.insertAdjacentHTML("afterbegin", html);
  });
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
  console.log(isFollowing);
  const btnText = isFollowing ? "Following" : "Follow";
  const buttonClass = isFollowing ? "followBtn following" : "followBtn";

  if (showFollowButton && userLoggedIn._id != userData._id) {
    htmlFollowButton = `<div class="followButtonContainer">
                              <button class='${buttonClass}' data-userid=${userData._id}>${btnText}</button>
                          </div>`;
  }

  // return `<div class='user'>
  //                 <div class='userImageContainer'>
  //                     <img src='${userData.profilePic}'>
  //                 </div>
  //                 <div class='userDetailsContainer'>
  //                     <div class='header'>
  //                         <a href='/profile/${userData.userName}'>${name}</a>
  //                         <span class='username'>@${userData.userName}</span>
  //                     </div>
  //                 </div>
  //                 ${htmlFollowButton}
  //             </div>`;
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
