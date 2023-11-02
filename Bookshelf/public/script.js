const searchButton = document.getElementById("search-button");
const reviewForm = document.getElementById("review-form");
const bookTitle = document.getElementById("book-title");
const reviewBookCover = document.getElementById("review-book-cover");
const authorElement = document.getElementById("author");
const reviewText = document.getElementById("review-text");
const addReviewButton = document.getElementById("add-review");
const readingListItems = document.getElementById("reading-list-items");
let selectedBook = null;
const starIcons = document.querySelectorAll(".star");
let selectedRating = 0;

searchButton.addEventListener("click", () => {
  const searchTerm = document.getElementById("search-input").value;
  searchBooks(searchTerm);
});

function searchBooks(searchTerm) {
  if (searchTerm) {
    fetch(`/search?term=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const books = data.filter((book) => book.cover_i);
          displayBookList(books);
        } else {
          console.error("Response data is not an array:", data);
        }
      })
      .catch((error) =>
        console.error("Error fetching data from your Node.js server:", error)
      );
  }
}

searchBooks("*");

function displayBookList(books) {
  const bookListContainer = document.querySelector(".book-list-container");
  bookListContainer.innerHTML = "";

  books.forEach((book) => {
    const bookItem = document.createElement("div");
    bookItem.classList.add("book-item");

    bookItem.innerHTML = `
      <h3>${book.title}</h3>
      <p>Author: ${
        book.author_name ? book.author_name.join(", ") : "Unknown"
      }</p>
    `;

    const centerDiv = document.createElement("div");
    centerDiv.classList.add("center-content");

    const coverImage = document.createElement("img");
    coverImage.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    centerDiv.appendChild(coverImage);

    const reviewButton = document.createElement("button");
    reviewButton.textContent = "Add Review";

    reviewButton.addEventListener("click", () => {
      selectedBook = book;
      bookTitle.textContent = book.title;
      authorElement.textContent = `Author: ${
        book.author_name ? book.author_name.join(", ") : "Unknown"
      }`;
      reviewBookCover.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
      reviewForm.style.display = "block";
    });

    centerDiv.appendChild(reviewButton);
    bookItem.appendChild(centerDiv);
    bookListContainer.appendChild(bookItem);
  });
}

function updateBookTitle(newTitle) {
  bookTitle.innerText = newTitle;
}

starIcons.forEach((star) => {
  star.addEventListener("click", () => {
    const starValue = parseInt(star.getAttribute("data-star"));
    selectedRating = starValue;
    updateStarRating();
  });
});

function updateStarRating() {
  starIcons.forEach((star) => {
    const starValue = parseInt(star.getAttribute("data-star"));
    if (starValue <= selectedRating) {
      star.classList.add("selected");
    } else {
      star.classList.remove("selected");
    }
  });
}

addReviewButton.addEventListener("click", () => {
  if (selectedBook) {
    if (selectedRating > 0 && reviewText.value) {
      const reviewTextValue = reviewText.value;

      const reviewData = {
        reviewText: reviewTextValue,
        selectedBook: selectedBook,
        selectedRating: selectedRating,
      };

      fetch("/add-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Review added successfully") {
            const reviewItem = document.createElement("li");
            reviewItem.innerHTML = `
              <div class="reading-list-item">
                <img class="reading-list-cover" src="https://covers.openlibrary.org/b/id/${
                  selectedBook.cover_i
                }-M.jpg" alt="Book Cover">
                <div class="reading-list-details">
                  <strong>${selectedBook.title}</strong><br>
                  Author: ${
                    selectedBook.author_name
                      ? selectedBook.author_name.join(", ")
                      : "Unknown"
                  }<br>
                  Review: ${reviewTextValue}<br>
                  Rating: ${selectedRating} stars
                </div>
              </div>
            `;
            readingListItems.appendChild(reviewItem);

            reviewForm.style.display = "none";
            reviewText.value = ""; // Clear the review text input
            selectedRating = 0;
            updateStarRating();
          } else {
            alert("Failed to add the review. Log in first!.");
          }
        })
        .catch((error) => {
          console.error("Error adding review:", error);
          alert("An error occurred. Please try again.");
        });
    } else {
      alert("Please select a rating and provide a review text.");
    }
  } else {
    alert("Please select a book before adding a review.");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Get a reference to the "Profile" button
  const profile = document.getElementById("profile");

  // Add a click event listener to the "Profile" button
  profile.addEventListener("click", function () {
    // Check if the user is logged in
    fetch("/check-login")
      .then((response) => response.json())
      .then((data) => {
        if (data.loggedIn) {
          // If the user is logged in, redirect to their profile page
          const username = data.username;
          window.location.href = `/user/${username}`;
        } else {
          // If the user is not logged in, you can handle it accordingly (e.g., show a login form)
          alert("Please log in to view your profile.");
        }
      })
      .catch((error) => {
        console.error("Error checking login status:", error);
      });
  });
});

document.getElementById("signin-btn").addEventListener("click", () => {
  // Load the login form using an AJAX request
  fetch("/loginForm.html")
    .then((response) => response.text())
    .then((data) => {
      // Replace the content of the page with the login form
      document.body.innerHTML = data;
      // Add the loginScript.js script dynamically
      const script = document.createElement("script");
      script.src = "loginScript.js";
      document.body.appendChild(script);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const categoriesButton = document.getElementById("categories");

  categoriesButton.addEventListener("click", function () {
    // Redirect to the '/categories' route
    window.location.href = "/categories";
  });

  // Assuming you have a button for each subject
  const subjectButtons = document.querySelectorAll(".subject-button");

  subjectButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const subject = button.getAttribute("data-subject");
      // Redirect to the '/books-by-subject' route with the selected subject
      window.location.href = `/books-by-subject?subject=${subject}`;
    });
  });
});

// Define a function to fetch categories and create buttons
async function fetchCategories() {
  try {
    const response = await fetch("/categories"); // Replace with your route
    const data = await response.json();
    const categoryList = document.getElementById("category-list");

    data.categories.forEach((category) => {
      const button = document.createElement("button");
      button.textContent = category.name;
      button.addEventListener("click", () =>
        fetchBooksByCategory(category.name)
      );
      categoryList.appendChild(button);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

// Define a function to fetch books by category
async function fetchBooksByCategory(category) {
  try {
    const response = await fetch(`/books-by-category?category=${category}`); // Replace with your route
    const data = await response.json();
    // Handle the received data, e.g., display the list of books.
  } catch (error) {
    console.error(`Error fetching books for category '${category}':`, error);
  }
}

// Add an event listener to the "Categories" button in the header
const categoriesButton = document.getElementById("categories");
categoriesButton.addEventListener("click", fetchCategories);
