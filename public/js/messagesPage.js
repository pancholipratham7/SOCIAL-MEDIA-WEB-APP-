let lastTypingTime = "";
let typing = false;

document.addEventListener("DOMContentLoaded", async function (e) {
  //JOINING A CHAT ROOM FIRST
  socket.emit("join room", chatId);

  // handling the typing event at the client side
  socket.on("typing", (data) => {
    document.querySelector(".typingDots").style.display = "block";
    console.log(`${data.user} is typing`);
  });

  // handling the stopping typing indicator event
  socket.on("stop typing", () => {
    document.querySelector(".typingDots").style.display = "none";
  });

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

  // outputting all the previous chat messages
  let allPreviousMessages = await axios.get("/api/messages", {
    params: { chatId: chatId },
  });

  let lastSenderId = "";
  outputAllPreviousMessages(allPreviousMessages.data.messages);

  function outputAllPreviousMessages(prevMessages) {
    console.log(prevMessages);
    if (prevMessages.length === 0) {
      return;
    }
    prevMessages.forEach((message, index) => {
      addChatMessageHtml(message, prevMessages[index + 1], lastSenderId);
      lastSenderId = message.sender._id;
    });
    scrollToBottom();
  }

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
      //updating the typing
      updateTyping();

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

    addChatMessageHtml(res.data.message, null, lastSenderId);
    scrollToBottom();
  }

  // function for adding sent message  on the message page
  function addChatMessageHtml(message, nextMessage, lastSenderId) {
    if (!message || !message._id) {
      return alert("Message is not valid");
    }
    const messageDiv = createMessageHtml(message, nextMessage, lastSenderId);
    addMessagesHtmlToPage(messageDiv);
  }

  //creating the messageHtml
  function createMessageHtml(message, nextMessage, lastSenderId) {
    console.log(message);
    console.log(nextMessage);
    console.log(lastSenderId);

    const sender = message.sender;
    const senderName = `${sender.firstName} ${sender.lastName}`;
    const currentSenderId = sender._id;
    const nextSenderId = nextMessage != null ? nextMessage.sender._id : "";
    const isFirst = lastSenderId != currentSenderId;
    const isLast = nextSenderId != currentSenderId;

    const isMine = message.sender._id === userLoggedIn._id;
    let liClassName = isMine ? "mine" : "theirs";
    let senderNameElement = "";

    if (isFirst) {
      liClassName += " first";
      if (!isMine) {
        senderNameElement = `<span class="senderName">${senderName}</span>`;
      }
    }

    let profileImageMessageElement = "";

    if (isLast) {
      liClassName += " last";
      profileImageMessageElement = `<img src="${sender.profilePic}">`;
    }

    let messageImageContainer = "";
    if (!isMine) {
      messageImageContainer = `<div class="imageContainer">
                                  ${profileImageMessageElement}
                               </div>`;
    }

    return `<li class='message ${liClassName}'>
              ${messageImageContainer}
              <div class='messageContainer'>
                  ${senderNameElement}
                  <span class='messageBody'>
                    ${message.content}
                  </span>
              </div>
             </li>`;
  }

  // adding messages Html to the page
  function addMessagesHtmlToPage(messageDiv) {
    document
      .querySelector(".chatMessages")
      .insertAdjacentHTML("beforeend", messageDiv);

    // scroll to bottom
  }

  //adding event on the button to save the changed chat Name
  document
    .getElementById("createChatNameButton")
    .addEventListener("click", async function (e) {
      const chatName = document.getElementById("chatNameTextBox").value.trim();
      const res = await axios.put(`/api/chats/${chatId}`, {
        chatName: chatName,
      });
      if (res.data.status === "success") {
        location.reload();
      } else {
        alert("Could Not update chat Name");
      }
    });

  //scrolling to the bottom page
  function scrollToBottom() {
    const container = document.querySelector(".chatMessages");
    const scrollHeight = container.scrollHeight;

    container.scrollTop = scrollHeight;
  }

  //function for updating the typing notification
  function updateTyping() {
    // if we are not connected to sockets then we need to return
    if (!connected) return;

    if (!typing) {
      socket.emit("typing", { user: userLoggedIn, chatId: chatId });
      typing = true;
    }

    // ALL LOGIC FOR STOPPING TYPING INDICATOR

    lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const currentTypingTime = new Date().getTime();
      const typingTimeDiff = currentTypingTime - lastTypingTime;
      if (typingTimeDiff >= timerLength && typing) {
        console.log("Stopping the typing Indicator");
        socket.emit("stop typing", chatId);
        typing = false;
      }
    }, timerLength);
  }
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
