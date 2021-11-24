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

//getting the chat latest message
function getLatestMessage(latestMessage) {
  console.log(latestMessage);
  if (latestMessage) {
    return `${latestMessage.sender.firstName} ${latestMessage.sender.lastName}: ${latestMessage.content}`;
  }
  return "New Chat";
}

//getting the chatName
//If we have not given our choice on selecting name for the group chat then by default the group chat will be set to all the user's Name
function getChatName(chatData) {
  let chatName = chatData.chatName;
  if (!chatName) {
    const otherChatUsers = getOtherChatUsers(chatData.users);
    let namesArray = otherChatUsers.map(
      (user) => user.firstName + " " + user.lastName
    );
    chatName = namesArray.join(", ");
  }

  return chatName;
}

function getOtherChatUsers(users) {
  if (users.length === 1) {
    console.log(users.length);
    return users;
  }
  return users.filter((user) => user._id !== userLoggedIn._id);
}

//Get chat image elements
function getChatImageElements(chatData) {
  const otherUsers = getOtherChatUsers(chatData.users);
  let groupChatClass = "";
  let chatImage = getUserChatImageElement(otherUsers[0]);
  if (otherUsers.length > 1) {
    groupChatClass = "groupChatImage";
    chatImage = chatImage + getUserChatImageElement(otherUsers[1]);
  }
  return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
  if (!user || !user.profilePic) {
    return alert("User passed in the function is invalid");
  }
  return `<img src=${user.profilePic} alt="User's profile picture">`;
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
