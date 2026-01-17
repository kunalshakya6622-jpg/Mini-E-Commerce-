// ------------------ STATE ------------------ //
let products = [];
let filteredProducts = [];
let cart = [];

let selectedCategory = "all";
let selectedPrice = 100;
let searchQuery = "";

const PER_PAGE = 9;
let currentIndex = 0;

const URL = "https://fakestoreapi.com/products";

// ------------------ DOM ------------------ //
  const search =document.querySelector("#searchBar");
  const range = document.querySelector("#priceRange");
  const grid = document.querySelector(".grid-Container");
  const loadBtn = document.querySelector(".loadBtn");
  const categories = document.querySelectorAll(".category-Section ul li");
  const cartBox = document.querySelector(".total-Price-Section");
  const rangeLabel = document.querySelector(".range-Label");

// ------------------ INIT ------------------ //
init();

function init() {
  loadCart();
  fetchProducts();
  bindEvents();
}

// ------------------ API ------------------ //
async function fetchProducts() {
  try {
    const res = await fetch(URL);
    if (!res.ok) throw new Error("Failed to fetch products");

    products = await res.json();
    filteredProducts = [...products];
    resetAndRender();
  } catch (err) {
    console.error(err);
  }
}

// ------------------ RENDER PRODUCTS ------------------ //
function resetAndRender() {
  currentIndex = 0;
  loadBtn.style.display = "block";
  grid.innerHTML = "";
  loadMore();
}

function loadMore() {
  const next = filteredProducts.slice(
    currentIndex,
    currentIndex + PER_PAGE
  );

  if (!next.length) {
    loadBtn.style.display = "none";
    return;
  }

  next.forEach(createCard);
  currentIndex += PER_PAGE;

  if (currentIndex >= filteredProducts.length) {
    loadBtn.style.display = "none";
  }
}

function createCard(product) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="img-Container">
      <img src="${product.image}" alt="${product.title}">
    </div>
    <div class="product-Details">
      <h3>${product.title}</h3>
      <p>category - ${product.category}</p>
      <p class="price-tag">$${product.price}</p>
      <div class="end-row">
        <button class="add-cart-btn" data-id="${product.id}">
          Add to Cart
        </button>
      </div>
    </div>
  `;

  grid.appendChild(card);
}

// ------------------ FILTER ------------------ //
function applyFilters() {
  let result = [...products];

  if (selectedCategory !== "all") {
    result = result.filter(
      p => p.category.toLowerCase() === selectedCategory
    );
  }

  result = result.filter(p => p.price <= selectedPrice);

  if (searchQuery) {
    result = result.filter(p =>
      p.title.toLowerCase().includes(searchQuery)
    );
  }

  filteredProducts = result;
  resetAndRender();
}

// ------------------ CART ------------------ //
function addToCart(id) {
  const item = cart.find(i => i.id === id);

  if (item) {
    item.quantity++;
  } else {
    const product = products.find(p => p.id === id);
    if (!product) return;

    cart.push({ ...product, quantity: 1 });
  }

  persistCart();
}

function updateQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  persistCart();
}

function persistCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function loadCart() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  renderCart();
}

function renderCart() {
  cartBox.innerHTML = "";

  if (!cart.length) {
    cartBox.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  let total = 0;
  cart.forEach(i => (total += i.price * i.quantity));

  const itemsHTML = cart.map(i => `
    <div class="cart">
      <p class ="productName">${i.title}</p>
      <div class="qty-controls">
        <button class="qty-minus" data-id="${i.id}">-</button>
        <span class ="qty-count">${i.quantity}</span>
        <button class="qty-plus" data-id="${i.id}">+</button>
      </div>
    </div>
  `).join("");

  cartBox.innerHTML = `
    <h3>Total: ₹${total.toFixed(2)}</h3>
    ${itemsHTML}
  `;
}

// ------------------ EVENTS ------------------ //
function bindEvents() {
  grid.addEventListener("click", e => {
    if (e.target.classList.contains("add-cart-btn")) {
      addToCart(Number(e.target.dataset.id));
    }
  });

  cartBox.addEventListener("click", e => {
    const id = Number(e.target.dataset.id);
    if (e.target.classList.contains("inc")) updateQuantity(id, 1);
    if (e.target.classList.contains("dec")) updateQuantity(id, -1);
  });

  categories.forEach(li => {
    li.addEventListener("click", () => {
      selectedCategory = li.dataset.category.toLowerCase();
      applyFilters();
    });
  });

  search.addEventListener("input", e => {
    searchQuery = e.target.value.toLowerCase();
    applyFilters();
  });

  range.addEventListener("input", e => {
    selectedPrice = Number(e.target.value);
    dom.rangeLabel.textContent = `$0 - $${selectedPrice}`;
    applyFilters();
  });

  loadBtn.addEventListener("click", loadMore);
}