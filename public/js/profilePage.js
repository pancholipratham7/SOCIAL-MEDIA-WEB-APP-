const getAllPosts = async () => {
  const repliesTab = selectedTab === "replies" ? true : false;

  let postsResult = await axios.get("/api/posts", {
    params: {
      postedBy: profileUserId,
      isReply: repliesTab,
    },
  });
  outputPosts(
    postsResult.data.posts,
    document.querySelector(".postsContainer")
  );
};

getAllPosts();
