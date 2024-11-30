// cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const updateCartSummary = () => {
    const cartItemsList = document.getElementById("cart-items");
    if (cartItemsList) {
        cartItemsList.innerHTML = ""; 

        let totalItems = 0;
        let totalAmount = 0;

        cart.forEach(item => {
            totalItems += item.quantity;
            totalAmount += item.quantity * item.price;

            const listItem = document.createElement("li");
            listItem.innerHTML = ` 
                <img src="${item.image}" alt="${item.name}" width="${200}" height="${200}" class="cart-item-image">
                <span>${item.name} (x${item.quantity}) - $${(item.quantity * item.price).toFixed(2)}</span>
                <button class="remove-from-cart" data-id="${item.id}">REMOVE</button>
            `;
            cartItemsList.appendChild(listItem);
        });

        document.getElementById("total-items").textContent = totalItems;
        document.getElementById("total-amount").textContent = totalAmount.toFixed(2);

        document.querySelectorAll(".remove-from-cart").forEach(button => {
            button.addEventListener("click", function() {
                const productId = this.getAttribute("data-id");
                removeFromCart(productId);
            });
        });
    }
};

// Function to add items to the cart
const addToCart = (productId, name, price, quantity, image) => {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, name, price, quantity, image });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();
};

const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();

    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (productCard) {
        const addToCartButton = productCard.querySelector(".add-to-cart");
        const goToCartButton = productCard.querySelector(".go-to-cart");

        addToCartButton.style.display = "inline-block";
        goToCartButton.style.display = "none";
    }
};

document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", function() {
        const productCard = this.closest(".product-card");
        const productId = productCard.getAttribute("data-id");
        const name = productCard.querySelector("h3").textContent;
        const price = parseFloat(productCard.getAttribute("data-price"));
        const quantity = parseInt(productCard.querySelector("input[type='number']").value);
        const image = productCard.querySelector("img").src;

        addToCart(productId, name, price, quantity, image);

        this.style.display = "none";
        productCard.querySelector(".go-to-cart").style.display = "inline-block";
    });
});

document.addEventListener("DOMContentLoaded", updateCartSummary);


// Checkout function to send cart data to the server
const checkout = async () => {
  // Map cart items for the request
  const cartItems = cart.map(item => ({
    name: item.name,
    price: item.price, // Price as a number
    quantity: item.quantity,
    image: item.image, // Image URL
  }));

  // Determine backend URL based on environment
  const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api/stripe-checkout' // Local backend URL
    : 'https://volshift-ecommerce-mpy5.vercel.app/api/stripe-checkout'; // Deployed backend URL

    console.log(baseUrl);
    console.log(cartItems);
  try {
    // Send cart items to the server
    const response = await fetch(baseUrl, {
      method: 'POST',
      body: JSON.stringify({ items: cartItems }),
    });

    const data = await response.json();
    console.log(data)
    // Redirect to Stripe Checkout if session URL is returned
    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error('Error:', data.error);
      alert('Checkout session could not be created.');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('An error occurred during checkout. Please try again.');
  }
};
