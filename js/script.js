let products = [];
let categories = [];
let cart = [];
let currentProduct = null;

const API_BASE = "https://fakestoreapi.com";

document.addEventListener("DOMContentLoaded", function () {
  loadProducts();
  loadCategories();
  updateCartDisplay();
});

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    products = await response.json();
    displayFeaturedProducts();
    displayAllProducts();
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/products/categories`);
    categories = await response.json();
    displayCategories();
    populateCategoryFilter();
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

function displayFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  const featuredProducts = products.slice(0, 8);
  container.innerHTML = featuredProducts
    .map((product) => createProductCard(product))
    .join("");
}

function displayAllProducts() {
  const container = document.getElementById("allProducts");
  container.innerHTML = products
    .map((product) => createProductCard(product))
    .join("");
}

function displayCategories() {
  const homeContainer = document.getElementById("categoryGrid");
  const allContainer = document.getElementById("allCategories");
  const categoryCards = categories
    .map((category) => createCategoryCard(category))
    .join("");

  homeContainer.innerHTML = categoryCards;
  allContainer.innerHTML = categoryCards;
}

function createProductCard(product) {
  return `
                <div class="product-card">
                    <img src="${product.image}" alt="${
    product.title
  }" class="product-image" onclick="showProductDetail(${product.id})">
                    <div class="product-content">
                        <h3 class="product-title" onclick="showProductDetail(${
                          product.id
                        })">${product.title}</h3>
                        <div class="product-price">$${product.price.toFixed(
                          2
                        )}</div>
                        <button class="add-to-cart" onclick="addToCart(${
                          product.id
                        })">Add to Cart</button>
                    </div>
                </div>
            `;
}

function createCategoryCard(category) {
  const categoryProduct = products.find((p) => p.category === category);
  const image = categoryProduct
    ? categoryProduct.image
    : "https://via.placeholder.com/300x200";

  return `
                <div class="category-card" onclick="showCategoryProducts('${category}')">
                    <img src="${image}" alt="${category}">
                    <div class="category-card-content">
                        <h3>${category}</h3>
                        <p>Explore ${category} products</p>
                    </div>
                </div>
            `;
}

function showProductDetail(productId) {
  currentProduct = products.find((p) => p.id === productId);
  if (currentProduct) {
    document.getElementById("modalImage").src = currentProduct.image;
    document.getElementById("modalTitle").textContent = currentProduct.title;
    document.getElementById(
      "modalPrice"
    ).textContent = `$${currentProduct.price.toFixed(2)}`;
    document.getElementById("modalDescription").textContent =
      currentProduct.description;
    document.getElementById("productModal").style.display = "block";
  }
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

function addToCartFromModal() {
  if (currentProduct) {
    addToCart(currentProduct.id);
    closeModal();
  }
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartDisplay();
  showNotification("Product added to cart!");
}

function updateCartDisplay() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.textContent = totalItems;
  cartTotal.textContent = totalPrice.toFixed(2);

  cartItems.innerHTML = cart.map((item) => createCartItem(item)).join("");
}

function createCartItem(item) {
  return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">$${item.price.toFixed(
                          2
                        )}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateQuantity(${
                              item.id
                            }, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${
                              item.id
                            }, 1)">+</button>
                            <button class="quantity-btn" onclick="removeFromCart(${
                              item.id
                            })" style="margin-left: 10px; background: #ff6b6b;">×</button>
                        </div>
                    </div>
                </div>
            `;
}

function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartDisplay();
    }
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartDisplay();
}

function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  cartSidebar.classList.toggle("open");
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");
}

function showCategoryProducts(category) {
  const categoryProducts = products.filter((p) => p.category === category);
  const container = document.getElementById("categoryProductsGrid");
  const title = document.getElementById("categoryTitle");

  title.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  container.innerHTML = categoryProducts
    .map((product) => createProductCard(product))
    .join("");

  showPage("categoryProducts");
}

function populateCategoryFilter() {
  const select = document.getElementById("categoryFilter");
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    select.appendChild(option);
  });
}

function filterProducts() {
  const categoryFilter = document.getElementById("categoryFilter").value;
  const sortFilter = document.getElementById("sortFilter").value;

  let filteredProducts = [...products];

  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === categoryFilter
    );
  }

  switch (sortFilter) {
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "title":
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  const container = document.getElementById("allProducts");
  container.innerHTML = filteredProducts
    .map((product) => createProductCard(product))
    .join("");
}

function searchProducts(event) {
  if (event.key === "Enter") {
    const query = event.target.value.toLowerCase();
    if (query.trim() === "") {
      showPage("home");
      return;
    }

    const searchResults = products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    const container = document.getElementById("searchResultsGrid");
    if (searchResults.length > 0) {
      container.innerHTML = searchResults
        .map((product) => createProductCard(product))
        .join("");
    } else {
      container.innerHTML =
        '<div class="loading">No products found matching your search.</div>';
    }

    showPage("searchResults");
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 3000;
                animation: slideInRight 0.3s ease;
            `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function payNow() {
  const totalPrice = cart
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  const options = {
    key: process.env.REACT_APP_API_KEY,
    amount: totalPrice * 100,
    currency: "INR",
    name: "ShopHub",
    description: "E-commerce Checkout",
    handler: function (response) {
      showNotification(
        "Payment Successful! Order ID: " + response.razorpay_payment_id
      );
      cart = [];
      updateCartDisplay();
      document.getElementById("checkoutForm").reset();
      showPage("home");
    },
    prefill: {
      name:
        document.getElementById("firstName").value +
        " " +
        document.getElementById("lastName").value,
      email: document.getElementById("email").value,
    },
    theme: {
      color: "#667eea",
    },
  };

  const rzp = new Razorpay(options);
  if (totalPrice > 1) {
    rzp.open();
  } else {
    showNotification("No item in cart");
  }
}

window.onclick = function (event) {
  const modal = document.getElementById("productModal");
  if (event.target === modal) {
    closeModal();
  }
};

const style = document.createElement("style");
style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCategories();
  updateCartDisplay();
});

window.onclick = function (e) {
  if (e.target === document.getElementById("productModal")) closeModal();
};
