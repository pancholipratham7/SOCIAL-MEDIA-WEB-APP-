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
function createPostHtml(postData) {
  //Just if some error occurs
  //Only for development purpose
  if (postData === null)
    return alert("PostData object is null in createpostHtml function");
  //Checking if the postData is about a retweet
  const isRetweet = postData.retweetData ? true : false;

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
  if (postData.replyTo) {
    if (!postData.replyTo._id) {
      console.log(postData.replyTo);
      alert("Reply to field id not present");
    }

    const replyToUsername = postData.replyTo.postedBy.userName;
    replyFlag = `<div class="replyFlag">Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a></div>`;
  }

  return `<div class='post' data-id=${postData._id}>
            <div class="postActionContainer">
            ${retweetText}
            </div>
            <div class="mainContentContainer">
              <div class="userImageContainer">
                <img src=${postedBy.profilePic}>
              </div>
              <div class="postContentContainer">
                <div class="header">
                  <a href="/profile/${
                    postedBy.userName
                  }" class="displayName">${displayName}</a>
                  <span class="username">@${postedBy.userName}</span>
                  <span class="date">${timestamps}</span>
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
  outputPosts(postData.post, document.querySelector("#originalPostContainer"));
});

//this event will be teriggered when the modal will be closed
$("#replyModal").on("hidden.bs.modal", async function (e) {
  document.querySelector("#originalPostContainer").innerHTML = "";
});

//Submit Post button click event handler and replyPost btn handler

[
  document.getElementById("submitPostButton"),
  document.getElementById("submitReplyButton"),
].forEach((item) => {
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
    if (e.target.closest(".post")) {
      const postId = e.target.closest(".post").dataset.id;
      window.location.href = `/post/${postId}`;
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
  let html = "";

  //if posts is not an array then changing it into an array
  if (!Array.isArray(posts)) {
    posts = [posts];
  }
  posts.forEach((post) => {
    html = createPostHtml(post);

    container.insertAdjacentHTML("afterbegin", html);
  });
  if (posts.length === 0) {
    container.insertAdjacentHTML(
      "afterbegin",
      '<span class="noResults">Nothing to show.</span>'
    );
  }
}
