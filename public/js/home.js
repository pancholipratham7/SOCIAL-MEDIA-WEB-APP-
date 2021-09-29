const getAllPosts = async () => {
  let postsResult = await fetch("/api/posts");
  postsResult = await postsResult.json();
  outputPosts(postsResult.posts, document.querySelector(".postsContainer"));
};

getAllPosts();

function outputPosts(posts, container) {
  let html = "";
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
