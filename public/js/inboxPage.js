document.addEventListener("DOMContentLoaded", async function (event) {
  const res = await axios.get("/api/chats");
  const chats = res.data.chats;
  console.log(chats);
  outputChatList(chats, document.querySelector(".resultsContainer"));
});

function outputChatList(chats, container) {
  console.log(container);
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

function createChatHtml(chatData) {
  const chatName = "Chat Name";
  const latestMessage = "This is the latest message";
  const image = "";

  return `<a href='/messages/${chatData._id}' class='resultListItem'>
            <div class='resultsDetailsContainer'>
                <span class='heading'>${chatName}</span>
                <span class='subtext'>${latestMessage}</span>
            </div>
    </a>`;
}
