// Sidebar
const hamBurger = document.querySelector(".toggle-btn");
hamBurger.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");
});

// API
const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");

let userMessage = null;
let isResponseGenerating = false;

// API configuration
const API_KEY = "AIzaSyC8e5jD2ccpBnEjLM9oKipA7O2xuMa8MBQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

// Load the local storage data when the page loads
const loadLocalStorageData = () => {
  const savedChats = localStorage.getItem("savedChats");
  const historyChats = localStorage.getItem("historyChats");
  const isLightMode = localStorage.getItem("themeColor") === "light_mode";

  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  chatList.innerHTML = savedChats || "";
  chatList.innerHTML = historyChats || "";

  document.body.classList.toggle("hide-header", savedChats);
  chatList.scrollTo(0, chatList.scrollHeight);
};

loadLocalStorageData();

// Create a message element and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Show typing effect by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(" ");
  let currentWordIndex = 0;
  const typingInterval = setInterval(() => {
    textElement.innerText +=
      (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("savedChats", chatList.innerHTML);
    }
    chatList.scrollTo(0, chatList.scrollHeight);
  }, 75);
};

// Fetch response from the API based on user's message
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");
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

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const apiResponse = data?.candidates[0].content.parts[0].text.replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    );
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
    chatList.scrollTop = chatList.scrollHeight;
  }
};

// Show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
  const html = `
        <div class="message-content">
            <img src="images/gemini.svg" alt="Gemini Image" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatList.appendChild(incomingMessageDiv);
  chatList.scrollTo(0, chatList.scrollHeight);

  generateAPIResponse(incomingMessageDiv);
};

// Copy the message text to the clipboard
const copyMessage = (copyIcon) => {
  const messageText = copyIcon.parentElement.querySelector(".text").innerText;
  navigator.clipboard.writeText(messageText);
  copyIcon.innerText = "done";
  setTimeout(() => (copyIcon.innerText = "content_copy"), 1000);
};

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
  userMessage =
    typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return;

  isResponseGenerating = true;

  const html = `
        <div class="message-content">
            <img src="images/nam2.jpg" alt="User Image" class="avatar">
            <p class="text"></p>
        </div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatList.appendChild(outgoingMessageDiv);

  const historyChats = localStorage.getItem("historyChats") || "";
  localStorage.setItem(
    "historyChats",
    historyChats + outgoingMessageDiv.outerHTML
  );
  typingForm.reset();
  chatList.scrollTo(0, chatList.scrollHeight);

  document.body.classList.add("hide-header");
  setTimeout(showLoadingAnimation, 500);
};

// Set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

// Toggle the theme of the website
toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Delete all chats from the chat list
deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all chats?")) {
    localStorage.removeItem("savedChats");
    loadLocalStorageData();
  }
});

// Prevent the default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

// Handle Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.querySelector("#login-email").value;
  const password = document.querySelector("#login-password").value;

  // Call your login API here (for demonstration, we use a mock response)
  const mockResponse = await mockLoginAPI(email, password);
  if (mockResponse.success) {
    alert("Login successful!");
    // Store user info in localStorage
    localStorage.setItem("userEmail", email);
    // Redirect or update UI as necessary
  } else {
    alert("Login failed: " + mockResponse.message);
  }
});

// Handle Registration
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.querySelector("#register-email").value;
  const password = document.querySelector("#register-password").value;

  // Call your register API here (for demonstration, we use a mock response)
  const mockResponse = await mockRegisterAPI(email, password);
  if (mockResponse.success) {
    alert("Registration successful! You can now log in.");
  } else {
    alert("Registration failed: " + mockResponse.message);
  }
});

// Mock login API
async function mockLoginAPI(email, password) {
  // Replace this with an actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === "test@example.com" && password === "password") {
        resolve({ success: true });
      } else {
        resolve({ success: false, message: "Invalid credentials." });
      }
    }, 1000);
  });
}

// Mock register API
async function mockRegisterAPI(email, password) {
  // Replace this with an actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
}
