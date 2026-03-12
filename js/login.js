/**
 * Login page logic
 * - validates form input
 * - authenticates against backend API
 * - stores JWT + current user in localStorage
 * - redirects based on authenticated role
 */

const API_BASE_URL = window.CartLivo_API_BASE_URL || "http://localhost:5000";
const REMEMBER_EMAIL_KEY = "rememberedEmail";
const AUTH_TOKEN_KEY = "authToken";
const CURRENT_USER_KEY = "currentUser";
const CURRENT_ADMIN_KEY = "currentAdmin";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMeInput = document.getElementById("rememberMe");
const formMessage = document.getElementById("formMessage");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearErrors() {
  emailError.textContent = "";
  passwordError.textContent = "";
  formMessage.textContent = "";
  formMessage.className = "form-message";
}

function validateForm() {
  clearErrors();
  let valid = true;

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!isValidEmail(email)) {
    emailError.textContent = "Please enter a valid email address.";
    valid = false;
  }

  if (password.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters.";
    valid = false;
  }

  return valid;
}

function fillRememberedEmail() {
  const remembered = localStorage.getItem(REMEMBER_EMAIL_KEY);
  if (!remembered) return;

  emailInput.value = remembered;
  rememberMeInput.checked = true;
}

function persistRememberedEmail(email) {
  if (rememberMeInput.checked) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }
}

function persistSession(user, token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);

  if (user.role === "admin") {
    localStorage.setItem(
      CURRENT_ADMIN_KEY,
      JSON.stringify({ id: user.id, fullName: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
    );
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify({ id: user.id, fullName: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
    );
    localStorage.removeItem(CURRENT_ADMIN_KEY);
  }
}

async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Login failed.");
  }

  return data;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) return;

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  try {
    const { user, token } = await loginUser(email, password);

    persistSession(user, token);
    persistRememberedEmail(email);

    formMessage.textContent = user.role === "admin" ? "Admin login successful! Redirecting..." : "Login successful! Redirecting...";
    formMessage.classList.add("success");

    setTimeout(() => {
      window.location.href = user.role === "admin" ? "admin-dashboard.html" : "dashboard.html";
    }, 800);
  } catch (error) {
    formMessage.textContent = error.message || "Invalid email or password.";
    formMessage.classList.add("error");
  }
});

fillRememberedEmail();
