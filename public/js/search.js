const searchBox = document.getElementById("searchBox");

//Here we will be adding a timer for searching the particular user or post in the database only when the user will stop typing
//Refer to react course in that react course we did the same

searchBox.addEventListener("keydown", function (e) {
  const searchType = document.getElementById("searchBox").dataset.search;
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (searchBox.value.trim() === "") {
      document.querySelector(".resultsContainer").textContent = "";
    } else {
      search(searchBox.value, searchType);
    }
  }, 1000);
});

//function for sending the request at the backend and searching for the user or posts based on the searchType
//we can't use here fetch because with get request in fetch we can't send the data
async function search(searchTerm, searchType) {
  const url = searchType === "users" ? "/api/users" : "/api/posts";

  const res = await axios.get(url, {
    params: {
      search: searchTerm,
    },
  });

  if (searchType === "users") {
    outputUsers(res.data.users, document.querySelector(".resultsContainer"));
  } else {
    outputPosts(res.data.posts, document.querySelector(".resultsContainer"));
  }
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