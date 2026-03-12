/** Render latest successful order from localStorage on confirmation page. */

const ORDER_STORAGE_KEY = "orders";
const LATEST_ORDER_KEY = "latestOrderId";

const orderIdEl = document.getElementById("orderId");
const orderDateEl = document.getElementById("orderDate");
const orderTotalEl = document.getElementById("orderTotal");
const orderItemsEl = document.getElementById("orderItems");

function loadLatestOrder() {
  const latestId = localStorage.getItem(LATEST_ORDER_KEY);
  const orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || "[]");
  if (!Array.isArray(orders) || orders.length === 0) return null;
  if (!latestId) return orders[orders.length - 1];
  return orders.find((o) => String(o.id) === String(latestId)) || orders[orders.length - 1];
}

function renderOrder(order) {
  if (!order) {
    orderItemsEl.innerHTML = "<p>No recent order found.</p>";
    return;
  }

  orderIdEl.textContent = `#${order.id}`;
  orderDateEl.textContent = new Date(order.createdAt).toLocaleString();
  orderTotalEl.textContent = `₹${(order.totals?.total || 0).toFixed(2)}`;

  orderItemsEl.innerHTML = "";
  order.items.forEach((item) => {
    const line = document.createElement("article");
    line.className = "item";
    line.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <p>Qty: ${item.quantity} × ₹${item.price.toFixed(2)}</p>
      </div>
      <strong>₹${(item.quantity * item.price).toFixed(2)}</strong>
    `;
    orderItemsEl.appendChild(line);
  });
}

renderOrder(loadLatestOrder());
