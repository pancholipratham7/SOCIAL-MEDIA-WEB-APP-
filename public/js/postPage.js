$(document).ready(async () => {
  let res = await fetch(`/api/posts/${postId}`);
  res = await res.json();
  post = res.post;
  outputPostsWithReplies(post, document.querySelector(".postsContainer"));
});
