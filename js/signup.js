/**
 * Signup page logic
 * - validates form fields
 * - creates account via backend API
 * - stores JWT + current user in localStorage
 */

const API_BASE_URL = "https://cartlivo-ecommerce.onrender.com";
const AUTH_TOKEN_KEY = "authToken";
const CURRENT_USER_KEY = "currentUser";
const CURRENT_ADMIN_KEY = "currentAdmin";

const signupForm = document.getElementById("signupForm");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const formMessage = document.getElementById("formMessage");

const fullNameError = document.getElementById("fullNameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

function clearErrors() {
  fullNameError.textContent = "";
  emailError.textContent = "";
  passwordError.textContent = "";
  confirmPasswordError.textContent = "";
  formMessage.textContent = "";
  formMessage.className = "form-message";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
  clearErrors();
  let valid = true;

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (fullName.length < 3) {
    fullNameError.textContent = "Full name must be at least 3 characters.";
    valid = false;
  }

  if (!isValidEmail(email)) {
    emailError.textContent = "Please enter a valid email address.";
    valid = false;
  }

  if (password.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters.";
    valid = false;
  }

  if (password !== confirmPassword) {
    confirmPasswordError.textContent = "Passwords do not match.";
    valid = false;
  }

  return valid;
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

async function signupUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Signup failed.");
  }

  return data;
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) return;

  const payload = {
    name: fullNameInput.value.trim(),
    email: emailInput.value.trim().toLowerCase(),
    password: passwordInput.value,
  };

  try {
    const { user, token } = await signupUser(payload);
    persistSession(user, token);

    formMessage.textContent = "Signup successful! Redirecting...";
    formMessage.classList.add("success");

    setTimeout(() => {
      window.location.href = user.role === "admin" ? "admin-dashboard.html" : "dashboard.html";
    }, 900);
  } catch (error) {
    formMessage.textContent = error.message || "Could not create account.";
    formMessage.classList.add("error");
  }
});
