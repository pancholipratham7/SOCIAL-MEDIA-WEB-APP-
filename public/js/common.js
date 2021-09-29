let submitPostBtn = document.getElementById("submitPostButton");

//Adding text area
document
  .querySelector(".textAreaContainer")
  .insertAdjacentHTML(
    "afterbegin",
    `<textarea id="postTextArea" placeholder="What's happening?"></textarea>`
  );

//Post html generator function
function createPostHtml(postData) {
  //Just if some error occurs
  //Only for development purpose
  if (postData === null)
    return alert("PostData object is null in createpostHtml function");
  //Checking if the postData is about a retweet
  const isRetweet = postData.retweetData ? true : false;
  console.log(isRetweet);

  //Finding the retweetedBy username
  const retweetedBy = isRetweet ? postData.postedBy.userName : null;
  console.log(retweetedBy);
  postData = isRetweet ? postData.retweetData : postData;
  console.log(postData);

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

//Disabling and enabling submit post button
const textArea = document.getElementById("postTextArea");
textArea.addEventListener("keyup", function (e) {
  const textValue = e.target.value.trim();
  if (textValue === "") {
    submitPostBtn.disabled = true;
  } else {
    submitPostBtn.removeAttribute("disabled");
  }
});

//Submit Post button click event handler
submitPostBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  const post = textArea.value;
  const postData = {
    content: post,
  };
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
    const html = createPostHtml(result.data);
    document
      .querySelector(".postsContainer")
      .insertAdjacentHTML("afterbegin", html);
    textArea.value = "";
    submitPostBtn.disabled = true;
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
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}
