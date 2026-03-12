/**
 * Product listing page logic
 * - fetches products from backend API
 * - renders search/category/price filtered results
 * - stores cart in localStorage for checkout flow
 */

const API_BASE_URL = window.CartLivo_API_BASE_URL || "http://localhost:5000";
const CART_STORAGE_KEY = "cart";

let products = [];

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const resultCount = document.getElementById("resultCount");
const resetFiltersBtn = document.getElementById("resetFilters");
const emptyState = document.getElementById("emptyState");
const cartCount = document.getElementById("cartCount");

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function updateCartCount() {
  const cart = loadCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = String(count);
}

async function loadProducts() {

  const cached = localStorage.getItem("productsCache");

  if (cached) {
    try {
      products = JSON.parse(cached);
      renderProducts(products);
    } catch {}
  }

  const response = await fetch(`${API_BASE_URL}/api/products`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  const formatted = data.map(p => ({
    id: p.id,
    name: p.name,
    category: (p.category || "general").toLowerCase(),
    price: Number(p.price) || 0,
    description: p.description || "",
    image: p.image || "https://via.placeholder.com/300",
    badge: p.stock > 0 ? "In Stock" : "Out of Stock",
    stock: Number(p.stock) || 0
  }));

  localStorage.setItem("productsCache", JSON.stringify(formatted));

  return formatted;
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product || product.stock <= 0) return;

  const cart = loadCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
  }

  saveCart(cart);
  updateCartCount();
}

function getPriceMatcher(value) {
  if (value === "0-50") return (price) => price <= 50;
  if (value === "51-100") return (price) => price >= 51 && price <= 100;
  if (value === "101-150") return (price) => price >= 101 && price <= 150;
  return () => true;
}

function renderProducts(items) {
  productGrid.innerHTML = "";

  items.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <span class="badge">${product.badge}</span>
      <div class="product-title-row">
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
      </div>
      <p>${product.description}</p>
      <div class="price-row">
        <strong>₹${product.price.toFixed(2)}</strong>        
        <span>${product.category}</span>
      </div>
      <button class="btn btn-primary add-to-cart" type="button" data-product-id="${product.id}" ${
      product.stock <= 0 ? "disabled" : ""
    }>${product.stock <= 0 ? "Out of Stock" : "Add to Cart"}</button>
    `;
    productGrid.appendChild(card);
  });

  resultCount.textContent = `Showing ${items.length} product${items.length === 1 ? "" : "s"}`;
  emptyState.hidden = items.length > 0;
}

function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const priceMatcher = getPriceMatcher(priceFilter.value);

  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesPrice = priceMatcher(product.price);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  renderProducts(filtered);
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-to-cart");
  if (!button) return;
  addToCart(button.dataset.productId);
});

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("change", applyFilters);
resetFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "all";
  priceFilter.value = "all";
  applyFilters();
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    products = await loadProducts();
    renderProducts(products);
  } catch (error) {
    resultCount.textContent = "Failed to load products";
    emptyState.hidden = false;
    emptyState.textContent = error.message || "Could not fetch products from API.";
  } finally {
    updateCartCount();
  }
})();
