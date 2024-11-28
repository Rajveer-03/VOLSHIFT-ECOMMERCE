// Admin credentials
const adminCredentials = {
    username: "admin",
    password: "admin123"
};

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form from submitting

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === adminCredentials.username && password === adminCredentials.password) {
        alert("Login successful!");
        localStorage.setItem("isAdminLoggedIn", true); // Save admin login status
        window.location.href = "admin-panel.html"; // Redirect to admin panel
    } else {
        document.getElementById("errorMessage").style.display = "block";
    }
});

// admin.js - Admin Panel Functions for Product Upload and Preview

document.getElementById("product-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    const productName = document.getElementById("product-name").value;
    const productPrice = document.getElementById("product-price").value;
    const productImage = imagePreview.src; // Get the uploaded image src (base64)

    if (!productName || !productPrice || !productImage) {
        alert("Please fill out all fields.");
        return; // Don't save if any field is missing
    }

    // Retrieve existing products, or initialize an empty array if no products exist
    let products = JSON.parse(localStorage.getItem("products")) || [];

    // Add the new product
    products.push({ name: productName, price: parseFloat(productPrice), image: productImage });

    // Save the updated products array back to localStorage
    localStorage.setItem("products", JSON.stringify(products));

    // Clear the form and hide the image preview after submitting
    document.getElementById("product-form").reset();
    imagePreview.style.display = "none";
    alert("Product saved successfully!");
});
