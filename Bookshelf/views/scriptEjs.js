function displayBookCover(coverUrl) {
  const coverImage = document.getElementById("book-cover-image");

  if (coverImage) {
    coverImage.src = coverUrl;
  } else {
    // Create a new image element and set its source
    const newCoverImage = document.createElement("img");
    newCoverImage.id = "book-cover-image";
    newCoverImage.src = coverUrl;

    // Append the image to the container where you want to display the cover
    const coverContainer = document.getElementById("cover-container");
    coverContainer.innerHTML = ""; // Clear existing content
    coverContainer.appendChild(newCoverImage);
  }
}
