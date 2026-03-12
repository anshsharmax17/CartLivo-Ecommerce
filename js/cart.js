/**
 * CART PAGE LOGIC
 * - Loads cart data from localStorage
 * - Renders all cart items
 * - Allows quantity updates and item removal
 * - Calculates subtotal, tax, delivery and total
 */

const CART_STORAGE_KEY = "cart";
const TAX_RATE = 0.08;
const DELIVERY_FEE = 79;

const cartItemsEl = document.getElementById("cartItems");
const emptyCartStateEl = document.getElementById("emptyCartState");
const cartSummaryEl = document.getElementById("cartSummary");
const itemCountLabelEl = document.getElementById("itemCountLabel");
const summarySubtotalEl = document.getElementById("summarySubtotal");
const summaryTaxEl = document.getElementById("summaryTax");
const summaryDeliveryEl = document.getElementById("summaryDelivery");
const summaryTotalEl = document.getElementById("summaryTotal");
const checkoutBtnEl = document.getElementById("checkoutBtn");

let cart = [];

/** Load cart from localStorage in required structure. */
function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];

    cart = parsed
      .map((item) => ({
        id: String(item.id),
        name: String(item.name || "Product"),
        price: Number(item.price) || 0,
        quantity: Math.max(1, Number(item.quantity) || 1),
        image: String(item.image || "https://via.placeholder.com/120x120?text=Product"),
      }))
      .filter((item) => item.id);

    return cart;
  } catch {
    cart = [];
    return cart;
  }
}

/** Persist current cart. */
function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

/** Render all cart items. */
function displayCartItems() {
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    emptyCartStateEl.hidden = false;
    cartSummaryEl.hidden = true;
    itemCountLabelEl.textContent = "0 items";
    return;
  }

  emptyCartStateEl.hidden = true;
  cartSummaryEl.hidden = false;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  itemCountLabelEl.textContent = `${totalItems} item${totalItems === 1 ? "" : "s"}`;

  cart.forEach((item) => {
    const subtotal = item.price * item.quantity;

    const article = document.createElement("article");
    article.className = "cart-item";
    article.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="item-details">
        <h3>${item.name}</h3>
        <p class="item-price">₹${item.price.toFixed(2)}</p>
        <p class="item-subtotal">Subtotal: ₹${subtotal.toFixed(2)}</p>
      </div>
      <div class="item-actions">
        <div class="qty-control">
          <button type="button" aria-label="Decrease quantity" data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button type="button" aria-label="Increase quantity" data-action="increase" data-id="${item.id}">+</button>
        </div>
        <button class="btn btn-danger" type="button" data-action="remove" data-id="${item.id}">Remove</button>
      </div>
    `;

    cartItemsEl.appendChild(article);
  });
}

/** Update quantity by delta (+1/-1). */
function updateQuantity(id, delta) {
  cart = cart
    .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
    .filter((item) => item.quantity > 0);

  saveCart();
  displayCartItems();
  calculateTotal();
}

/** Remove item from cart. */
function removeItem(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  displayCartItems();
  calculateTotal();
}

/** Calculate and render summary totals. */
function calculateTotal() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const delivery = cart.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + tax + delivery;

  summarySubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  summaryTaxEl.textContent = `₹${tax.toFixed(2)}`;
  summaryDeliveryEl.textContent = `₹${delivery.toFixed(2)}`;
  summaryTotalEl.textContent = `₹${total.toFixed(2)}`;
}

cartItemsEl.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action]");
  if (!target) return;

  const { action, id } = target.dataset;
  if (!id) return;

  if (action === "increase") updateQuantity(id, 1);
  if (action === "decrease") updateQuantity(id, -1);
  if (action === "remove") removeItem(id);
});

checkoutBtnEl.addEventListener("click", () => {
  window.location.href = "checkout.html";
});

loadCart();
displayCartItems();
calculateTotal();
