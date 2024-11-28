// Redirect if admin is not logged in
if (!localStorage.getItem("isAdminLoggedIn")) {
    alert("You must be logged in to access the admin panel.");
    window.location.href = "admin-login.html";
}

// Logout functionality
document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "admin-login.html";
});

// Fetch products from localStorage
const productList = document.getElementById("productList");
let products = JSON.parse(localStorage.getItem("products")) || [];

// Render product list
const renderProducts = () => {
    productList.innerHTML = "";
    products.forEach((product, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <strong>${product.name}</strong> - $${product.price.toFixed(2)}
            <img src="${product.image}" alt="${product.name}" width="100">
            <button data-index="${index}" class="deleteProduct">Delete</button>
        `;
        productList.appendChild(listItem);
    });

    // Attach delete functionality
    document.querySelectorAll(".deleteProduct").forEach(button => {
        button.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            products.splice(index, 1);
            localStorage.setItem("products", JSON.stringify(products));
            renderProducts();
        });
    });
};

// Initial render
renderProducts();

// Handle adding new products
document.getElementById("addProductForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const image = document.getElementById("productImage").value;

    products.push({ name, price, image });
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();

    // Clear form
    e.target.reset();
});
