/**
 * Checkout page logic
 * - loads cart items from localStorage
 * - renders checkout summary
 * - validates form
 * - opens Razorpay payment
 * - creates order after payment success
 */

const API_BASE_URL = "https://cartlivo-ecommerce.onrender.com";
const AUTH_TOKEN_KEY = "authToken";
const CART_STORAGE_KEY = "cart";
const LATEST_ORDER_KEY = "latestOrderId";

const TAX_RATE = 0.08;
const DELIVERY_FEE = 99;

const checkoutItemsEl = document.getElementById("checkoutItems");
const emptyCartHintEl = document.getElementById("emptyCartHint");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const deliveryEl = document.getElementById("delivery");
const totalEl = document.getElementById("total");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");

let currentCart = [];
let currentTotals = { total: 0 };

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

function renderSummary(cart) {

  checkoutItemsEl.innerHTML = "";

  if (!cart.length) {
    emptyCartHintEl.hidden = false;
  } else {
    emptyCartHintEl.hidden = true;

    cart.forEach(item => {
      const row = document.createElement("article");
      row.className = "checkout-item";

      row.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <p>Qty: ${item.quantity}</p>
        </div>
        <strong>₹${(item.price * item.quantity).toFixed(2)}</strong>
      `;

      checkoutItemsEl.appendChild(row);
    });
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const delivery = cart.length ? DELIVERY_FEE : 0;
  const total = subtotal + tax + delivery;

  subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  taxEl.textContent = `₹${tax.toFixed(2)}`;
  deliveryEl.textContent = `₹${delivery.toFixed(2)}`;
  totalEl.textContent = `₹${total.toFixed(2)}`;

  return { subtotal, tax, delivery, total };
}

function validateForm() {

  const requiredIds = [
    "fullName",
    "phone",
    "address",
    "city",
    "postalCode"
  ];

  for (const id of requiredIds) {
    const field = document.getElementById(id);
    if (!field.value.trim()) {
      checkoutMessage.textContent = "Please fill all required fields.";
      checkoutMessage.className = "checkout-message error";
      return false;
    }
  }

  return true;
}

async function placeOrder(token, cart, total) {

  const products = cart.map(item => ({
    productId: item.id,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity)
  }));

  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      products,
      total
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to place order.");
  }

  return data;
}

async function startRazorpayPayment(amount) {

  const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount
    })
  });

  const order = await response.json();

  const options = {
    key: "rzp_test_SQRZ0ZsEdG6ZsC",
    amount: order.amount,
    currency: "INR",
    name: "CartLivo",
    description: "Order Payment",
    order_id: order.id,

    handler: async function () {

      try {

        const token = loadToken();

        const data = await placeOrder(token, currentCart, currentTotals.total);

        localStorage.setItem(LATEST_ORDER_KEY, String(data.order?.id || ""));
        localStorage.removeItem(CART_STORAGE_KEY);

        checkoutMessage.textContent = "Payment successful! Redirecting...";
        checkoutMessage.className = "checkout-message success";

        setTimeout(() => {
          window.location.href = "order-confirmation.html";
        }, 1200);

      } catch (error) {

        checkoutMessage.textContent = error.message;
        checkoutMessage.className = "checkout-message error";

      }

    },

    theme: {
      color: "#6366f1"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

checkoutForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const token = loadToken();

  if (!token) {
    checkoutMessage.textContent = "Please login before placing an order.";
    checkoutMessage.className = "checkout-message error";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);

    return;
  }

  const cart = loadCart();

  if (!cart.length) {
    checkoutMessage.textContent = "Your cart is empty.";
    checkoutMessage.className = "checkout-message error";
    return;
  }

  if (!validateForm()) return;

  currentCart = cart;
  currentTotals = renderSummary(cart);

  try {

    await startRazorpayPayment(currentTotals.total);

  } catch (error) {

    checkoutMessage.textContent = error.message;
    checkoutMessage.className = "checkout-message error";

  }

});

currentCart = loadCart();
currentTotals = renderSummary(currentCart);