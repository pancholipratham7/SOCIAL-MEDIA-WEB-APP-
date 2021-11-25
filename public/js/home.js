const getAllPosts = async () => {
  let postsResult = await axios.get("/api/posts", {
    params: {
      followingOnly: true,
    },
  });
  outputPosts(
    postsResult.data.posts,
    document.querySelector(".postsContainer")
  );
};

getAllPosts();
