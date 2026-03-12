/**
 * Admin dashboard logic
 * - reads sample/localStorage analytics data
 * - renders summary cards, top products, recent orders
 * - builds charts using Chart.js
 */

const STORAGE_KEY = "adminAnalytics";

const summaryEls = {
  totalSales: document.getElementById("totalSales"),
  totalOrders: document.getElementById("totalOrders"),
  totalUsers: document.getElementById("totalUsers"),
  totalProducts: document.getElementById("totalProducts"),
};

const topProductsList = document.getElementById("topProductsList");
const recentOrdersTableBody = document.getElementById("recentOrdersTableBody");

function getDefaultAnalytics() {
  return {
    summary: {
      totalSales: 254990,
      totalOrders: 1860,
      totalUsers: 942,
      totalProducts: 128,
    },
    monthlySales: [12000, 18000, 14500, 21000, 24500, 28000, 31500, 29500, 33000, 36000, 38500, 40990],
    monthlyOrders: [80, 110, 95, 140, 170, 190, 220, 210, 230, 255, 270, 289],
    categories: {
      Electronics: 35,
      Fashion: 24,
      Home: 18,
      Fitness: 13,
      Beauty: 10,
    },
    topProducts: [
      { name: "Pulse Pro Earbuds", sold: 482 },
      { name: "Vision 4K Monitor", sold: 356 },
      { name: "Urban Denim Jacket", sold: 298 },
      { name: "Active Smartwatch", sold: 274 },
      { name: "Smart Brew Kettle", sold: 241 },
    ],
    recentOrders: [
      { id: 10921, customer: "Ansh Sharma", total: 3499, status: "processing" },
      { id: 10920, customer: "Neha Rao", total: 1899, status: "shipped" },
      { id: 10919, customer: "Rahul Verma", total: 7599, status: "delivered" },
      { id: 10918, customer: "Aman Gupta", total: 2299, status: "processing" },
      { id: 10917, customer: "Sara Khan", total: 4199, status: "delivered" },
    ],
  };
}

function loadAnalytics() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // fallback to defaults
  }
  const fallback = getDefaultAnalytics();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
  return fallback;
}

function formatINR(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function renderSummary(summary) {
  summaryEls.totalSales.textContent = formatINR(summary.totalSales);
  summaryEls.totalOrders.textContent = String(summary.totalOrders);
  summaryEls.totalUsers.textContent = String(summary.totalUsers);
  summaryEls.totalProducts.textContent = String(summary.totalProducts);
}

function renderTopProducts(products) {
  topProductsList.innerHTML = "";
  products.forEach((product) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${product.name}<br /><small>Top performer</small></span><strong>${product.sold} sold</strong>`;
    topProductsList.appendChild(li);
  });
}

function getStatusClass(status) {
  if (status === "delivered") return "status-delivered";
  if (status === "shipped") return "status-shipped";
  return "status-processing";
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderRecentOrders(orders) {
  recentOrdersTableBody.innerHTML = "";
  orders.forEach((order) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${order.id}</td>
      <td>${order.customer}</td>
      <td>${formatINR(order.total)}</td>
      <td><span class="status-pill ${getStatusClass(order.status)}">${capitalize(order.status)}</span></td>
    `;
    recentOrdersTableBody.appendChild(tr);
  });
}

function renderCharts(data) {
  Chart.defaults.color = "#cde6d9";
  Chart.defaults.borderColor = "#234133";

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  new Chart(document.getElementById("salesLineChart"), {
    type: "line",
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: "Sales (₹)",
          data: data.monthlySales,
          borderColor: "#19c46b",
          backgroundColor: "rgba(25, 196, 107, 0.18)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
    },
  });

  new Chart(document.getElementById("ordersBarChart"), {
    type: "bar",
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: "Orders",
          data: data.monthlyOrders,
          backgroundColor: "rgba(102, 255, 170, 0.7)",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    },
  });

  new Chart(document.getElementById("categoryPieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(data.categories),
      datasets: [
        {
          data: Object.values(data.categories),
          backgroundColor: ["#19c46b", "#2fbf71", "#56cf8e", "#22995a", "#7ad9a8"],
          borderColor: "#0f1712",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
    },
  });
}

function initAdminDashboard() {
  const data = loadAnalytics();
  renderSummary(data.summary);
  renderTopProducts(data.topProducts);
  renderRecentOrders(data.recentOrders);
  renderCharts(data);
}

initAdminDashboard();
