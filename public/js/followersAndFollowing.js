window.addEventListener("DOMContentLoaded", function (e) {
  if (selectedTab === "following") {
    loadFollowing();
  } else if (selectedTab === "followers") {
    loadFollowers();
  }
});

async function loadFollowers() {
  let followers = await fetch(`/api/users/${profileUserId}/followers`);
  followers = await followers.json();
  outputUsers(
    followers.data.followers,
    document.querySelector(".resultsContainer")
  );
}

async function loadFollowing() {
  let following = await fetch(`/api/users/${profileUserId}/following`);
  following = await following.json();
  outputUsers(
    following.data.following,
    document.querySelector(".resultsContainer")
  );
}

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
    container.insertAdjacentHTML("afterbegin", html);
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

  return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.userName}'>${name}</a>
                        <span class='username'>@${userData.userName}</span>
                    </div>
                </div>
                ${htmlFollowButton}
            </div>`;
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
