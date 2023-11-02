const express = require("express");
const axios = require("axios");
const path = require("path");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session"); // Import express-session
const app = express();
const port = 3000;
const cors = require("cors");
const fs = require("fs");
const pathh = require("path");
const ejs = require("ejs");
const subjects = {
  ARTS: [
    "Architecture",
    "Art Instruction",
    "Art History",
    "Dance",
    "Design",
    "Fashion",
    "Film",
    "Graphic Design",
    "Music",
    "Music Theory",
    "Painting",
    "Photography",
  ],
  ANIMALS: ["Bears", "Cats", "Kittens", "Dogs", "Puppies"],
  FICTION: [
    "Fantasy",
    "Historical Fiction",
    "Horror",
    "Humor",
    "Literature",
    "Magic",
    "Mystery and detective stories",
    "Plays",
    "Poetry",
    "Romance",
    "Science Fiction",
    "Short Stories",
    "Thriller",
    "Young Adult",
  ],
  SCIENCE_MATH: [
    "Biology",
    "Chemistry",
    "Mathematics",
    "Physics",
    "Programming",
  ],
  BUSINESS_FINANCE: [
    "Management",
    "Entrepreneurship",
    "Business Economics",
    "Business Success",
    "Finance",
  ],
  CHILDRENS: [
    "Kids Books",
    "Stories in Rhyme",
    "Baby Books",
    "Bedtime Books",
    "Picture Books",
  ],
  HISTORY: [
    "Ancient Civilization",
    "Archaeology",
    "Anthropology",
    "World War II",
    "Social Life and Customs",
  ],
  HEALTH_WELLNESS: [
    "Cooking",
    "Cookbooks",
    "Mental Health",
    "Exercise",
    "Nutrition",
    "Self-help",
  ],
  BIOGRAPHY: [
    "Autobiographies",
    "History",
    "Politics and Government",
    "World War II",
    "Women",
    "Kings and Rulers",
    "Composers",
    "Artists",
  ],
  SOCIAL_SCIENCES: [
    "Anthropology",
    "Religion",
    "Political Science",
    "Psychology",
  ],
  PLACES: ["Brazil", "India", "Indonesia", "United States"],
  TEXTBOOKS: [
    "History",
    "Mathematics",
    "Geography",
    "Psychology",
    "Algebra",
    "Education",
    "Business & Economics",
    "Science",
    "Chemistry",
    "English Language",
    "Physics",
    "Computer Science",
  ],
  BOOKS_BY_LANGUAGE: [
    "English",
    "French",
    "Spanish",
    "German",
    "Russian",
    "Italian",
    "Chinese",
    "Japanese",
  ],
};

app.use(cors());

app.use(express.static("public"));
app.use(express.json()); // Add this line to parse JSON requests

app.set("view engine", "ejs");
app.set("views", pathh.join(__dirname, "views"));

// Create a database connection
const db = new sqlite3.Database("book_reviews.db");
const dbLogin = new sqlite3.Database("users_log.db");

dbLogin.serialize(() => {
  dbLogin.run(`
    CREATE TABLE IF NOT EXISTS users_login (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT
    )
  `);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS book_reviews (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      title TEXT,
      author TEXT,
      review TEXT,
      rating INTEGER,
      FOREIGN KEY(user_id) REFERENCES users_login(id)
    )
  `);
});

// API endpoint for searching books
app.get("/search", async (req, res) => {
  try {
    const searchTerm = req.query.term;
    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }

    const response = await axios.get(
      `https://openlibrary.org/search.json?q=${searchTerm}`
    );
    const data = response.data;

    // Filter the books retrieved from the API to include only those with cover images
    const books = data.docs.filter((book) => book.cover_i);

    res.json(books);
  } catch (error) {
    console.error("Error fetching data from Open Library:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

// Login and Signup

app.use(
  session({
    secret: "secretdiscret", // Change this to a secret key
    resave: false,
    saveUninitialized: true,
  })
);

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  dbLogin.get(
    "SELECT username, password FROM users_login WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (row) {
          bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return res.status(500).json({ error: "Internal server error" });
            } else if (result) {
              req.session.user = {
                username: username,
                loggedIn: true,
              };
              return res.json({ success: true, message: "Login successful" });
            } else {
              return res.status(401).json({ error: "Invalid password" });
            }
          });
        } else {
          return res.status(401).json({ error: "User not found" });
        }
      }
    }
  );
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  dbLogin.get(
    "SELECT username FROM users_login WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ error: "Internal server error" });
      } else if (row) {
        return res.status(400).json({ error: "Username already exists" });
      } else {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing the password:", err);
            return res.status(500).json({ error: "Internal server error" });
          } else {
            dbLogin.run(
              "INSERT INTO users_login (username, password) VALUES (?, ?)",
              [username, hashedPassword],
              (err) => {
                if (err) {
                  console.error("Error adding user to the database:", err);
                  return res
                    .status(500)
                    .json({ error: "Internal server error" });
                } else {
                  return res.json({
                    success: true,
                    message: "Sign-up successful",
                  });
                }
              }
            );
          }
        });
      }
    }
  );
});

app.post("/logout", (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        return res.json({ success: true, message: "Logged out successfully" });
      }
    });
  } else {
    return res.status(401).json({ error: "Not logged in" });
  }
});
// Check if the user is logged in
app.get("/check-login", (req, res) => {
  if (req.session.user && req.session.user.loggedIn) {
    res.json({
      loggedIn: true,
      username: req.session.user.username,
    });
  } else {
    res.json({ loggedIn: false });
  }
});

function setNewSession(username, res) {
  req.session.user = {
    username: username,
    loggedIn: true,
  };
  res.json({ success: true, message: "Login successful" });
}

app.get("/loginForm.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "loginForm.html"));
});

app.get("/user/:username", (req, res) => {
  // Check if the user is logged in
  if (req.session.user && req.session.user.loggedIn) {
    if (req.params.username === req.session.user.username) {
      dbLogin.get(
        "SELECT id FROM users_login WHERE username = ?",
        [req.params.username],
        (err, user) => {
          if (err) {
            console.error("Error querying the database:", err);
            return res.status(500).json({ error: "Internal server error" });
          }

          if (user) {
            db.all(
              "SELECT title, author, review, rating FROM book_reviews WHERE user_id = ?",
              [user.id],
              (err, reviews) => {
                if (err) {
                  console.error("Error querying the database:", err);
                  return res
                    .status(500)
                    .json({ error: "Internal server error" });
                }

                // Render the "profile.ejs" template and pass data to it
                res.render("profile", {
                  username: req.params.username,
                  book_reviews: reviews,
                });
              }
            );
          } else {
            res.status(404).json({ error: "User not found" });
          }
        }
      );
    } else {
      res.status(403).json({ error: "Access denied" });
    }
  } else {
    res.redirect("/loginForm.html");
  }
});

app.post("/add-review", (req, res) => {
  const reviewText = req.body.reviewText;
  const selectedBook = req.body.selectedBook;
  const selectedRating = req.body.selectedRating;

  if (selectedBook && selectedRating > 0 && reviewText && req.session.user) {
    const username = req.session.user.username;

    // First, query the users_login database to retrieve the user_id based on the username
    dbLogin.get(
      "SELECT id FROM users_login WHERE username = ?",
      [username],
      (err, row) => {
        if (err) {
          console.error("Error querying the database:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (row) {
          const user_id = row.id;

          // Insert the review data into the "book_reviews" table without specifying the auto-incremented id
          db.run(
            "INSERT INTO book_reviews (user_id, title, author, review, rating) VALUES (?, ?, ?, ?, ?)",
            [
              user_id, // Use the retrieved user_id
              selectedBook.title,
              selectedBook.author_name
                ? selectedBook.author_name.join(", ")
                : "Unknown",
              reviewText,
              selectedRating,
            ],
            (err) => {
              if (err) {
                console.error("Error adding review to the database:", err);
                res.status(500).json({ error: "Internal server error" });
              } else {
                res.json({ message: "Review added successfully" });
              }
            }
          );
        } else {
          res.status(401).json({ error: "User not found" });
        }
      }
    );
  } else {
    res.status(400).json({ error: "Invalid review data" });
  }
});

app.get("/categories", (req, res) => {
  // Render the categories template and pass the categories
  res.render("categories.ejs", { subjects });
});

app.get("/books-by-subject", async (req, res) => {
  try {
    const subject = req.query.subject;
    const limit = 10; // Set the limit to the number of books you want to fetch
    const page = 1;
    // Fetch books from the selected subject and include cover information and publishDate
    const encodedSubject = encodeURIComponent(subject);
    const apiUrl = `https://openlibrary.org/subjects/${encodedSubject}.json?limit=${limit}&page=${page}`;
    const response = await axios.get(apiUrl);
    const books = response.data?.works || [];
    const publishDate = books[0].first_publish_year || "N/A";
    books[0].publishDate = publishDate;

    if (books.length === 0) {
      return res.status(500).json({
        error: `Failed to retrieve books for the '${subject}' subject`,
      });
    }

    // Render an HTML page with the list of books, including cover and publishDate
    res.render("books.ejs", {
      subject,
      page,
      limit,
      books,
    });
  } catch (error) {
    console.error(
      `Error fetching '${subject}' books from Open Library:`,
      error
    );
    res.status(500).json({ error: "Internal server error" });
  }
});

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing the database:", err);
    }
    console.log("Database connection closed");
    process.exit();
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
