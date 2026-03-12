/**
 * Dashboard logic:
 * - reads user session + commerce data from localStorage
 * - renders welcome, summary cards, recent orders and profile info
 * - supports logout
 */

const CURRENT_USER_KEY = "currentUser";
const ORDER_STORAGE_KEY = "orders";
const CART_STORAGE_KEY = "cart";
const WISHLIST_STORAGE_KEY = "wishlist";

const welcomeText = document.getElementById("welcomeText");
const totalOrdersEl = document.getElementById("totalOrders");
const cartItemsCountEl = document.getElementById("cartItemsCount");
const wishlistItemsCountEl = document.getElementById("wishlistItemsCount");
const ordersListEl = document.getElementById("ordersList");
const emptyOrdersEl = document.getElementById("emptyOrders");
const profileNameEl = document.getElementById("profileName");
const profileEmailEl = document.getElementById("profileEmail");
const profileSinceEl = document.getElementById("profileSince");
const logoutBtn = document.getElementById("logoutBtn");

function parseStorageArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
  } catch {
    return null;
  }
}

function getOrderStatus(order, index) {
  // Prefer explicit status if present, otherwise infer a demo status.
  if (order.status) return String(order.status).toLowerCase();
  const fallback = ["processing", "shipped", "delivered"];
  return fallback[index % fallback.length];
}

function statusClass(status) {
  if (status === "delivered") return "status-delivered";
  if (status === "shipped") return "status-shipped";
  return "status-processing";
}

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function renderDashboard() {
  const user = loadCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const orders = parseStorageArray(ORDER_STORAGE_KEY).slice().reverse();
  const cartItems = parseStorageArray(CART_STORAGE_KEY);
  const wishlistItems = parseStorageArray(WISHLIST_STORAGE_KEY);

  // Welcome and profile information.
  welcomeText.textContent = `Welcome back, ${user.fullName || user.email}!`;
  profileNameEl.textContent = user.fullName || "Not set";
  profileEmailEl.textContent = user.email || "Not set";
  profileSinceEl.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently";

  // Summary cards.
  totalOrdersEl.textContent = String(orders.length);
  cartItemsCountEl.textContent = String(cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0));
  wishlistItemsCountEl.textContent = String(wishlistItems.length);

  // Recent orders + tracking status.
  ordersListEl.innerHTML = "";
  if (!orders.length) {
    emptyOrdersEl.hidden = false;
    return;
  }
  emptyOrdersEl.hidden = true;

  orders.slice(0, 8).forEach((order, index) => {
    const itemsCount = Array.isArray(order.items)
      ? order.items.reduce((acc, item) => acc + (item.quantity || 0), 0)
      : 0;
    const total = order.totals?.total || 0;
    const status = getOrderStatus(order, index);

    const row = document.createElement("article");
    row.className = "order-row";
    row.innerHTML = `
      <div>
        <strong>Order #${order.id}</strong>
        <p>${new Date(order.createdAt).toLocaleString()} • ${itemsCount} item(s)</p>
        <span class="status-pill ${statusClass(status)}">${statusLabel(status)}</span>
      </div>
      <strong>₹${total.toFixed(2)}</strong>
    `;
    ordersListEl.appendChild(row);
  });
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = "login.html";
});

renderDashboard();
