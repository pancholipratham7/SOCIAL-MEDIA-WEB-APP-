document.addEventListener("DOMContentLoaded", async function (e) {
  // ADDING USER IMAGES ON THE MESSAGES PAGE
  const chatImageHtmlMarkup = createChatImages(chatData, userLoggedIn);
  document
    .querySelector(".chatTitleBarContainer")
    .insertAdjacentHTML("afterbegin", chatImageHtmlMarkup);

  //Adding the chat Name
  const chatInfo = await axios.get(`/api/chats/${chatId}`);
  console.log(chatInfo);
  console.log(chatInfo.data.chat);
  console.log(getChatName(chatInfo.data.chat));
  document.getElementById("chatName").textContent = getChatName(
    chatInfo.data.chat
  );

  //adding the event to send Message Button
  document
    .querySelector(".sendMessageButton")
    .addEventListener("click", function (e) {
      messageSubmitted();
    });

  //adding event to input message box for 'ENTER KEY'
  document
    .querySelector(".inputTextBox")
    .addEventListener("keydown", async function (e) {
      if (e.key === "Enter") {
        // This is important because enter automatically adds a new line
        //preventDefault will stop the default behaviour
        e.preventDefault();
        await messageSubmitted();
      }
    });

  async function messageSubmitted() {
    const content = document.querySelector(".inputTextBox").value.trim();
    if (content) {
      await sendMessage(content);
      document.querySelector(".inputTextBox").value = "";
      console.log("Message Submitted");
    }
  }

  async function sendMessage(content) {
    const res = await axios.post("/api/messages", {
      content: content,
      chat: chatId,
    });

    if (res.data.status === "failed") {
      alert(res.data.error);
      document.getElementById(".inputTextBox").value = content;
      return;
    }

    console.log(res.data.message);
    addChatMessageHtml(res.data.message);
  }

  // function for adding sent message  on the message page
  function addChatMessageHtml(message) {
    if (!message || !message._id) {
      return alert("Message is not valid");
    }
    const messageDiv = createMessageHtml(message);
    document
      .querySelector(".chatMessages")
      .insertAdjacentHTML("beforeend", messageDiv);
  }

  //creating the messageHtml
  function createMessageHtml(message) {
    const isMine = message.sender._id === userLoggedIn._id;
    const liClassName = isMine ? "mine" : "theirs";
    return `<li class='message ${liClassName}'>
              <div class='messageContainer'>
                <span class='messageBody'>
                  ${message.content}
                </span>
              </div>
            </li>`;
  }

  //adding event on the button to save the changed chat Name
  document
    .getElementById("createChatNameButton")
    .addEventListener("click", async function (e) {
      console.log("hi");
      const chatName = document.getElementById("chatNameTextBox").value.trim();
      console.log(chatName);
      const res = await axios.put(`/api/chats/${chatId}`, {
        chatName: chatName,
      });
      if (res.data.status === "success") {
        location.reload();
      } else {
        alert("Could Not update chat Name");
      }
    });
});

function createChatImages(chatData, userLoggedIn) {
  const maxImagesToShow = 3;
  let i = 0;
  let chatImageHtml = "";
  let userCount = "";
  //deciding the number of remaining users and displaying number
  if (chatData.users.length > maxImagesToShow + 1) {
    userCount = `<div class="userCount"><span>+${
      chatData.users.length - (maxImagesToShow + 1)
    }</span></div>`;
  }
  for (let j = 0; j < chatData.users.length; j++) {
    const user = chatData.users[j];
    console.log(user._id, typeof user._id);
    console.log(userLoggedIn._id, typeof userLoggedIn._id);
    if (i === maxImagesToShow) {
      break;
    }

    if (user._id === userLoggedIn._id) {
      console.log("HI");
      continue;
    }

    chatImageHtml =
      chatImageHtml +
      `<img src=${user.profilePic} alt="User's profile picture" title=${user.firstName}>`;
    i++;
  }

  return `<div class="chatImagesContainer">
            ${userCount}
            ${chatImageHtml}
          </div>`;
}
