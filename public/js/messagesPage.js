document.addEventListener("DOMContentLoaded", function (e) {
  const chatImageHtmlMarkup = createChatImages(chatData, userLoggedIn);
  document
    .querySelector(".chatTitleBarContainer")
    .insertAdjacentHTML("afterbegin", chatImageHtmlMarkup);
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
