// ============================================
// script.js — Client-Side JavaScript
// ============================================
// Handles: Navigation, Validation, API calls,
// Dashboard loading, and Logout
// ============================================

// ============================================
// 1. MOBILE NAVIGATION TOGGLE
// ============================================
// On mobile screens, the nav links are hidden.
// The hamburger button (☰) toggles them open/closed.

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// ============================================
// 2. HELPER: Show Message
// ============================================
// Displays success or error messages on forms.
// type = "success" or "error"

function showMessage(elementId, message, type) {
  const messageDiv = document.getElementById(elementId);
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = "message " + type; // adds "success" or "error" class
    messageDiv.style.display = "block";
  }
}

// ============================================
// 3. DYNAMIC NAVIGATION HELPER
// ============================================
// Updates navbar options if student is logged in
async function checkAuthNav() {
  try {
    const res = await fetch("/api/user");
    if (res.ok) {
      const data = await res.json();
      if (data.success && navLinks) {
        // User is logged in, adjust navlinks if on public page
        const isDashboard = window.location.pathname.endsWith("dashboard.html");
        navLinks.innerHTML = `
          <li><a href="index.html" class="${window.location.pathname.endsWith("index.html") || window.location.pathname === "/" ? "active" : ""}">Home</a></li>
          <li><a href="dashboard.html" class="${isDashboard ? "active" : ""}">Dashboard</a></li>
          <li><a href="about.html" class="${window.location.pathname.endsWith("about.html") ? "active" : ""}">About Us</a></li>
          <li><a href="#" id="dynamicLogout">Logout (${escapeHtml(data.user.name.split(" ")[0])})</a></li>
        `;
        const dynLogout = document.getElementById("dynamicLogout");
        if (dynLogout) {
          dynLogout.addEventListener("click", handleLogout);
        }
      }
    }
  } catch (e) {
    // Server not reached or not logged in; keep default nav links
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================
// 4. REGISTRATION FORM VALIDATION & SUBMIT
// ============================================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // ---------- GET FORM VALUES ----------
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const department = document.getElementById("department").value;
    const phone = document.getElementById("phone").value.trim();

    // Get selected gender radio button
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const gender = genderInput ? genderInput.value : "";

    // ---------- VALIDATION ----------
    if (!name || !email || !password || !confirmPassword || !department || !gender || !phone) {
      showMessage("registerMessage", "Please fill in all fields.", "error");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("registerMessage", "Please enter a valid email address.", "error");
      return;
    }

    // Check password length
    if (password.length < 6) {
      showMessage("registerMessage", "Password must be at least 6 characters.", "error");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      showMessage("registerMessage", "Passwords do not match.", "error");
      return;
    }

    // Validate phone number (exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      showMessage("registerMessage", "Phone number must be exactly 10 digits.", "error");
      return;
    }

    // ---------- SEND TO SERVER ----------
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          department,
          gender,
          phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("registerMessage", data.message + " Redirecting to login...", "success");
        registerForm.reset();
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        showMessage("registerMessage", data.message, "error");
      }
    } catch (error) {
      showMessage("registerMessage", "Server error. Please try again later.", "error");
    }
  });
}

// ============================================
// 5. LOGIN FORM VALIDATION & SUBMIT
// ============================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showMessage("loginMessage", "Please enter both email and password.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("loginMessage", "Please enter a valid email address.", "error");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("loginMessage", "Login successful! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 800);
      } else {
        showMessage("loginMessage", data.message || "Invalid credentials.", "error");
      }
    } catch (error) {
      showMessage("loginMessage", "Network or server error. Please try again.", "error");
    }
  });
}

// ============================================
// 6. DASHBOARD LOADING & PROFILE DISPLAY
// ============================================
const dashboardContainer = document.getElementById("dashboardContainer");

async function loadDashboard() {
  if (!dashboardContainer) return;

  try {
    const response = await fetch("/api/user");
    const data = await response.json();

    if (!response.ok || !data.success || !data.user) {
      // User is not logged in, redirect to login page
      window.location.href = "login.html";
      return;
    }

    const user = data.user;

    // Populate dashboard fields
    const headingEl = document.getElementById("dashHeadingName");
    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const deptEl = document.getElementById("userDept");
    const genderEl = document.getElementById("userGender");
    const phoneEl = document.getElementById("userPhone");
    const joinedEl = document.getElementById("userJoined");

    if (headingEl) headingEl.textContent = user.name.split(" ")[0];
    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (deptEl) deptEl.textContent = user.department;
    if (genderEl) genderEl.textContent = user.gender;
    if (phoneEl) phoneEl.textContent = user.phone;

    if (joinedEl) {
      if (user.created_at) {
        const dateObj = new Date(user.created_at);
        joinedEl.textContent = isNaN(dateObj) ? user.created_at : dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else {
        joinedEl.textContent = "Recently Registered";
      }
    }
  } catch (error) {
    console.error("Failed to load user profile:", error);
    window.location.href = "login.html";
  }
}

// ============================================
// 7. LOGOUT HANDLER
// ============================================
async function handleLogout(e) {
  if (e) e.preventDefault();
  try {
    await fetch("/api/logout", {
      method: "POST",
    });
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout failed:", error);
    window.location.href = "login.html";
  }
}

const logoutBtn = document.getElementById("logoutBtn");
const navLogout = document.getElementById("navLogout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}
if (navLogout) {
  navLogout.addEventListener("click", handleLogout);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (dashboardContainer) {
    loadDashboard();
  } else {
    checkAuthNav();
  }
});
