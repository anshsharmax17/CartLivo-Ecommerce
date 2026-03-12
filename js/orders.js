/**
 * Admin Orders Management
 * - loads orders from localStorage or fallback sample JSON
 * - supports search and status filtering
 * - allows status updates and persists them
 * - opens modal with full order details
 */

const ORDERS_KEY = "adminOrders";
const CHECKOUT_ORDERS_KEY = "orders";

const ordersTableBody = document.getElementById("ordersTableBody");
const searchOrdersInput = document.getElementById("searchOrders");
const statusFilter = document.getElementById("statusFilter");
const emptyOrders = document.getElementById("emptyOrders");
const detailsModal = document.getElementById("detailsModal");
const modalContent = document.getElementById("modalContent");
const closeModalBtn = document.getElementById("closeModal");

let ordersData = [];

function defaultOrders() {
  return [
    {
      id: "ORD001",
      customer: "John Doe",
      email: "john@example.com",
      date: "2026-03-09",
      total: 2500,
      status: "Pending",
      items: [
        { name: "Pulse Pro Earbuds", quantity: 1, price: 1499 },
        { name: "Aero Wireless Mouse", quantity: 1, price: 1001 },
      ],
    },
    {
      id: "ORD002",
      customer: "Sara Khan",
      email: "sara@example.com",
      date: "2026-03-10",
      total: 4199,
      status: "Shipped",
      items: [{ name: "Vision 4K Monitor", quantity: 1, price: 4199 }],
    },
  ];
}

function loadOrders() {
  try {
    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    if (Array.isArray(existing) && existing.length) return existing;
  } catch {
    // fallback path below
  }

  // Try deriving from checkout orders if present
  try {
    const checkoutOrders = JSON.parse(localStorage.getItem(CHECKOUT_ORDERS_KEY) || "[]");
    if (Array.isArray(checkoutOrders) && checkoutOrders.length) {
      const transformed = checkoutOrders.map((order, idx) => ({
        id: order.id ? `ORD${order.id}` : `ORDX${idx + 1}`,
        customer: order.customer || "Customer",
        email: order.email || "-",
        date: (order.createdAt || new Date().toISOString()).slice(0, 10),
        total: Number(order.totals?.total || 0),
        status: order.status || "Processing",
        items: Array.isArray(order.items)
          ? order.items.map((item) => ({
              name: item.name || "Product",
              quantity: Number(item.quantity || 1),
              price: Number(item.price || 0),
            }))
          : [],
      }));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(transformed));
      return transformed;
    }
  } catch {
    // ignore
  }

  const fallback = defaultOrders();
  localStorage.setItem(ORDERS_KEY, JSON.stringify(fallback));
  return fallback;
}

function saveOrders(data) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(data));
}

function statusClass(status) {
  const value = String(status).toLowerCase();
  if (value === "delivered") return "status-delivered";
  if (value === "shipped") return "status-shipped";
  if (value === "cancelled") return "status-cancelled";
  if (value === "processing") return "status-processing";
  return "status-pending";
}

function renderOrders() {
  const searchText = searchOrdersInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = ordersData.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchText) ||
      order.customer.toLowerCase().includes(searchText);
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  ordersTableBody.innerHTML = "";

  if (!filtered.length) {
    emptyOrders.hidden = false;
    return;
  }

  emptyOrders.hidden = true;

  filtered.forEach((order) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.date}</td>
      <td>₹${Number(order.total).toLocaleString("en-IN")}</td>
      <td>
        <span class="status-badge ${statusClass(order.status)}">${order.status}</span>
        <select class="status-select" data-order-id="${order.id}">
          ${["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
            .map(
              (status) =>
                `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`
            )
            .join("")}
        </select>
      </td>
      <td>
        <button class="btn btn-ghost view-details" data-order-id="${order.id}" type="button">View Details</button>
      </td>
    `;
    ordersTableBody.appendChild(tr);
  });
}

function updateOrderStatus(orderId, nextStatus) {
  ordersData = ordersData.map((order) =>
    order.id === orderId ? { ...order, status: nextStatus } : order
  );
  saveOrders(ordersData);
  renderOrders();
}

function openDetails(orderId) {
  const order = ordersData.find((entry) => entry.id === orderId);
  if (!order) return;

  const itemsMarkup = (order.items || [])
    .map(
      (item) => `
        <li>
          <span>${item.name}</span>
          <small>Qty: ${item.quantity} × ₹${Number(item.price).toLocaleString("en-IN")}</small>
        </li>
      `
    )
    .join("");

  modalContent.innerHTML = `
    <p><strong>Order:</strong> ${order.id}</p>
    <p><strong>Customer:</strong> ${order.customer} (${order.email || "-"})</p>
    <p><strong>Date:</strong> ${order.date}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <h3>Products</h3>
    <ul class="modal-items">${itemsMarkup || "<li>No products available</li>"}</ul>
    <p><strong>Total:</strong> ₹${Number(order.total).toLocaleString("en-IN")}</p>
  `;

  detailsModal.hidden = false;
}

ordersTableBody.addEventListener("change", (event) => {
  const select = event.target.closest(".status-select");
  if (!select) return;
  updateOrderStatus(select.dataset.orderId, select.value);
});

ordersTableBody.addEventListener("click", (event) => {
  const button = event.target.closest(".view-details");
  if (!button) return;
  openDetails(button.dataset.orderId);
});

searchOrdersInput.addEventListener("input", renderOrders);
statusFilter.addEventListener("change", renderOrders);
closeModalBtn.addEventListener("click", () => {
  detailsModal.hidden = true;
});

detailsModal.addEventListener("click", (event) => {
  if (event.target === detailsModal) detailsModal.hidden = true;
});

ordersData = loadOrders();
renderOrders();
