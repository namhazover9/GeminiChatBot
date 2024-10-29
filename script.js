const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;
let isResponseGenerating = false;

// API configuration
const API_KEY = "AIzaSyC8e5jD2ccpBnEjLM9oKipA7O2xuMa8MBQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

// Load the local storage data when the page loads
const loadLocalStorageData = () => {
  const savedChats = localStorage.getItem("savedChats"); // Get the saved chats from the local storage
  const isLightMode = localStorage.getItem("themeColor") === "light_mode"; // Getting the local storage themeColor value

  // Apply the stored theme to the website
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  // Restore the chat list from the local storage
  chatList.innerHTML = savedChats || ""; // Set the chat list to the saved chats or an empty string

  document.body.classList.toggle("hide-header", savedChats); // Hide the header if there are saved chats
  chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom of the chat list
};

loadLocalStorageData(); // Load the local storage data when the page loads

// Create a message element and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div"); // Create a div element
  div.classList.add("message", ...classes); // Add the class name "message" to the div
  div.innerHTML = content; // Add the content to the div
  return div;
};

// Show typing effect by displaying words one by one and Save the chat list to the local storage
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(" "); // Split the text into words
  let currentWordIndex = 0; // Initialize the current word index

  const typingInterval = setInterval(() => {
    // Append each word to the text element with a space
    textElement.innerText +=
      (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++]; // Append the current word to the text element
    incomingMessageDiv.querySelector(".icon").classList.add("hide"); // Hide the copy icon
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval); // Clear the typing interval
      isResponseGenerating = false; // Set the response generating state to false
      incomingMessageDiv.querySelector(".icon").classList.remove("hide"); // Show the copy icon
      localStorage.setItem("savedChats", chatList.innerHTML); // Save the chat list to the local storage
    }
    chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom of the chat list
  }, 20); // Set the typing speed
};

// Fetch response from the API based on user's message
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text"); // Get the text element of the incoming message

  // Send a POST request to the API with the user's message
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      }),
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) throw new Error(data.error.message); // Throw an error if the response is not ok

    // Get the API response text and remove asterisks from it
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    ); // Extract the response from the JSON data
    showTypingEffect(apiResponse, textElement, incomingMessageDiv); // Show typing effect for the API response
  } catch (error) {
    isResponseGenerating = false; // Set the response generating state to false
    textElement.innerText = error.message; // Display the error message in the text element
    textElement.classList.add("error"); // Add the "error" class to the text
  } finally {
    incomingMessageDiv.classList.remove("loading"); // Remove the "loading" class from the incoming message
    chatList.scrollTop = chatList.scrollHeight; // Scroll to the bottom of the chat list
  }
};

// Show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
  const html = `
        <div class="message-content">
            <img src="images/BigF.png" alt="Gemini Image" class="avatar">
            <div class="text-container-bot">
                <p class="text"></p>
            </div>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading"); // Create an incoming message element
  chatList.appendChild(incomingMessageDiv); // Append the incoming message to the chat list
  chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom of the chat list

  generateAPIResponse(incomingMessageDiv); // Fetch the API response
};

// Copy the message text to the clipboard
const copyMessage = (copyIcon) => {
  const messageText = copyIcon.parentElement.querySelector(".text").innerText; // Get the text element of the message
  navigator.clipboard.writeText(messageText); // Copy the message text to the clipboard
  copyIcon.innerText = "done"; // Change the icon to a checkmark
  setTimeout(() => (copyIcon.innerText = "content_copy"), 1000); // Change the icon back to a copy icon after 1 sec
  // Copy the message text to the clipboard
};

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
  userMessage =
    typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return; // Exit if the user message is empty

  isResponseGenerating = true; // Set the response generating state to true

  const html = `
        
        <div class="message-content" >
            <img src="images/nam2.jpg" alt="User Image" class="avatar">
            <div class="text-container-user">
                <p class="text"></p>
            </div>
        </div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing"); // Create an outgoing message element
  outgoingMessageDiv.querySelector(".text").innerText = userMessage; // Set the user message to the text element
  chatList.appendChild(outgoingMessageDiv); // Append the outgoing message to the chat list

  typingForm.reset(); // Clear input field
  chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom of the chat list

  document.body.classList.add("hide-header"); // Hide the header once chat starts
  setTimeout(showLoadingAnimation, 500);
};

// Set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText; // Get the text of the suggestion
    handleOutgoingChat(); // Handle the outgoing chat
  });
});

// Toggle the theme of the website
toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode"); // Save selected theme on browser local storage by themeColor name
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Delete all chats from the chat list
deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all chats?")) {
    localStorage.removeItem("savedChats"); // Remove the saved chats from the local storage
    loadLocalStorageData();
  }
});

// Prevent the default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  handleOutgoingChat();
});
