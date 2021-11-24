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

//creating chat Html
function createChatHtml(chatData) {
  const chatName = getChatName(chatData);
  const latestMessage = getLatestMessage(chatData.latestMessage);
  const image = getChatImageElements(chatData);

  //background color for unread chats should be blue
  const activeClass =
    !chatData.latestMessage ||
    chatData.latestMessage.readBy.includes(userLoggedIn._id)
      ? ""
      : "active";

  return `<a href='/messages/${chatData._id}' class="resultListItem ${activeClass}">
            ${image}
            <div class='resultsDetailsContainer ellipsis'>
                <span class='heading ellipsis'>${chatName}</span>
                <span class='subtext ellipsis'>${latestMessage}</span>
            </div>
    </a>`;
}
