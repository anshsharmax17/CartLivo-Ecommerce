/**
 * Profile page logic
 * - loads current user from localStorage
 * - displays profile info and placeholder avatar
 * - updates profile, address, and password
 * - supports logout
 */

const USERS_STORAGE_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

const displayName = document.getElementById("displayName");
const displayEmail = document.getElementById("displayEmail");
const avatarPlaceholder = document.getElementById("avatarPlaceholder");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileSince = document.getElementById("profileSince");
const profileMessage = document.getElementById("profileMessage");

const profileForm = document.getElementById("profileForm");
const addressForm = document.getElementById("addressForm");
const passwordForm = document.getElementById("passwordForm");
const logoutBtn = document.getElementById("logoutBtn");
const logoutBtnSide = document.getElementById("logoutBtnSide");

function loadCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
  } catch {
    return null;
  }
}

function loadUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function setMessage(text, type = "success") {
  profileMessage.textContent = text;
  profileMessage.className = `message ${type}`;
}

function requireAuth() {
  const currentUser = loadCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return null;
  }
  return currentUser;
}

function renderProfile(user) {
  displayName.textContent = user.fullName || "User";
  displayEmail.textContent = user.email || "-";
  avatarPlaceholder.textContent = (user.fullName || user.email || "U").charAt(0).toUpperCase();

  document.getElementById("fullName").value = user.fullName || "";
  document.getElementById("email").value = user.email || "";

  const address = user.address || {};
  document.getElementById("addressLine").value = address.addressLine || "";
  document.getElementById("city").value = address.city || "";
  document.getElementById("postalCode").value = address.postalCode || "";
}

function updateUserInStorage(updatedUser) {
  const users = loadUsers();
  const idx = users.findIndex((u) => String(u.id) === String(updatedUser.id));

  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updatedUser };
  } else {
    users.push(updatedUser);
  }

  saveUsers(users);
  saveCurrentUser(updatedUser);
  renderProfile(updatedUser);
}

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const currentUser = requireAuth();
  if (!currentUser) return;

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();

  if (!fullName || !email) {
    setMessage("Name and email are required.", "error");
    return;
  }

  const users = loadUsers();
  const duplicate = users.some(
    (u) => String(u.id) !== String(currentUser.id) && (u.email || "").toLowerCase() === email
  );

  if (duplicate) {
    setMessage("This email is already used by another account.", "error");
    return;
  }

  const updated = { ...currentUser, fullName, email };
  updateUserInStorage(updated);
  setMessage("Profile updated successfully.");
});

addressForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const currentUser = requireAuth();
  if (!currentUser) return;

  const addressLine = document.getElementById("addressLine").value.trim();
  const city = document.getElementById("city").value.trim();
  const postalCode = document.getElementById("postalCode").value.trim();

  const updated = {
    ...currentUser,
    address: { addressLine, city, postalCode },
  };

  updateUserInStorage(updated);
  setMessage("Address saved successfully.");
});

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const currentUser = requireAuth();
  if (!currentUser) return;

  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword.length < 6) {
    setMessage("New password must be at least 6 characters.", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    setMessage("Passwords do not match.", "error");
    return;
  }

  const updated = { ...currentUser, password: newPassword };
  updateUserInStorage(updated);
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
  setMessage("Password changed successfully.");
});

function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = "login.html";
}

logoutBtn.addEventListener("click", logout);
logoutBtnSide.addEventListener("click", logout);

const initialUser = requireAuth();
if (initialUser) {
  profileName.textContent = initialUser.fullName || "Not set";
  profileEmail.textContent = initialUser.email || "Not set";
  profileSince.textContent = initialUser.createdAt
    ? new Date(initialUser.createdAt).toLocaleDateString()
    : "Recently";
  renderProfile(initialUser);
}
