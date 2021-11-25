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
