const getAllPosts = async () => {
  let postsResult = await fetch("/api/posts");
  postsResult = await postsResult.json();
  outputPosts(postsResult.posts, document.querySelector(".postsContainer"));
};

getAllPosts();


