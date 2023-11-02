// Replace with your server's URL
const serverURL = "http://localhost:3000";

function login() {
  let username = document.getElementById("login-username").value;
  let password = document.getElementById("login-password").value;

  // Send a POST request to the server to validate the login
  fetch(`${serverURL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Sign-in successful. You are now logged in.");
        // Redirect to the user's profile
        window.location.href = `/user/${username}`; // Redirect to the dynamic profile URL
      } else {
        // Alert for login failure
        alert("Login failed. Please try again.");
      }
    });
}

document.getElementById("login-submit").addEventListener("click", login);
document.getElementById("signup-submit").addEventListener("click", signup);

function signup() {
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  // Send a POST request to the server to create a new user
  fetch(`${serverURL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Sign-up successful. You can now log in.");
      } else {
        alert("Sign-up failed. Please try again.");
      }
    });
}

function toggleForms(isLogin) {
  const loginFormContent = document.getElementById("login-form-content");
  const signupFormContent = document.getElementById("signup-form-content");

  if (isLogin) {
    loginFormContent.style.display = "block";
    signupFormContent.style.display = "none";
  } else {
    loginFormContent.style.display = "none";
    signupFormContent.style.display = "block";
  }
}

document.getElementById("login-btn").addEventListener("click", function () {
  toggleForms(true);
});

// Add event listener for the "Sign Up" button
document.getElementById("signup-btn").addEventListener("click", function () {
  toggleForms(false);
});

document.addEventListener("DOMContentLoaded", () => {
  // Add an event listener for the "Logout" button with id "logout-link"
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default link behavior
      logout(); // Call the logout function
    });
  }
});

function logout() {
  // Send a POST request to the server to destroy the session
  fetch(`${serverURL}/logout`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Alert for successful logout
        alert("Logged out successfully.");

        // Clear the user name and password fields
        document.getElementById("login-username").value = "";
        document.getElementById("login-password").value = "";
        document.getElementById("signup-username").value = "";
        document.getElementById("signup-password").value = "";

        // Hide the profile view
        hideProfileView();

        // Redirect to the login page
        window.location.href = "/loginForm.html";
      } else {
        // Alert for logout failure
        alert("Logout failed. Please try again.");
      }
    });
}
