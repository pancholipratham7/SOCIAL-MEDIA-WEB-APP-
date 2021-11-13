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
  const chatName = getChatName(chatData);
  const latestMessage = "This is the latest message";
  const image = getChatImageElements(chatData);

  return `<a href='/messages/${chatData._id}' class='resultListItem'>
            ${image}
            <div class='resultsDetailsContainer ellipsis'>
                <span class='heading ellipsis'>${chatName}</span>
                <span class='subtext ellipsis'>${latestMessage}</span>
            </div>
    </a>`;
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
  console.log(chatData);
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
