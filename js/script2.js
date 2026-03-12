const CART_STORAGE_KEY = "cart";

const products = [
  { id: "pulse-pro-earbuds", name: "Pulse Pro Earbuds", category: "electronics", price: 89, description: "Noise cancellation • 36hr battery", image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=300&q=80", badge: "Best Seller" },
  { id: "glow-desk-lamp", name: "Glow Desk Lamp", category: "home", price: 49, description: "Adaptive lighting • USB-C charging", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80", badge: "New" },
  { id: "flexfit-training-set", name: "FlexFit Training Set", category: "fitness", price: 129, description: "Resistance bands • Smart tracker", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80", badge: "Limited" },
  { id: "street-snap-backpack", name: "Street Snap Backpack", category: "fashion", price: 79, description: "Water-resistant • 20L capacity", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80", badge: "Trending" },
  { id: "smart-brew-kettle", name: "Smart Brew Kettle", category: "home", price: 99, description: "Precise temperature • Auto keep-warm", image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=300&q=80", badge: "Popular" },
  { id: "neo-run-shoes", name: "Neo Run Shoes", category: "fitness", price: 59, description: "Lightweight build • Responsive sole", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80", badge: "Hot" },
  { id: "vision-4k-monitor", name: "Vision 4K Monitor", category: "electronics", price: 149, description: "Ultra HD panel • HDR ready", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80", badge: "Premium" },
  { id: "aero-wireless-mouse", name: "Aero Wireless Mouse", category: "electronics", price: 39, description: "Silent clicks • Ergonomic grip", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=300&q=80", badge: "Value" },
  { id: "cozy-throw-blanket", name: "Cozy Throw Blanket", category: "home", price: 45, description: "Soft knit • All-season comfort", image: "https://plus.unsplash.com/premium_photo-1670512215279-7bbb677d52de?q=80&w=687t", badge: "Comfort" },
  { id: "urban-denim-jacket", name: "Urban Denim Jacket", category: "fashion", price: 109, description: "Classic fit • Durable fabric", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80", badge: "Style" },
  { id: "zen-yoga-mat", name: "Zen Yoga Mat", category: "fitness", price: 35, description: "Non-slip surface • 6mm cushioning", image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=300&q=80", badge: "Essential" },
  { id: "active-smartwatch", name: "Active Smartwatch", category: "electronics", price: 119, description: "Heart-rate tracking • GPS", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80", badge: "Top Pick" },
];

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

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

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
      <button class="btn btn-primary add-to-cart" type="button" data-product-id="${product.id}">Add to Cart</button>
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

renderProducts(products);
updateCartCount();
