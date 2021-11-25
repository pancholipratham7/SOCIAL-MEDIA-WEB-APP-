document.addEventListener("DOMContentLoaded", async function (event) {
  const res = await axios.get("/api/chats");
  const chats = res.data.chats;
  outputChatList(chats, document.querySelector(".resultsContainer"));
});

function outputChatList(chats, container) {
  chats.forEach((chat) => {
    const html = createChatHtml(chat);
    container.insertAdjacentHTML("afterbegin", html);
  });

  if (chats.length === 0) {
    container.insertAdjacentHTML(
      "afterbegin",
      '<span class="noResults">Nothing to show.</span>'
    );
  }
}
