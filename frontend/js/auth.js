// js/auth.js

// ====================== REGISTER USER ======================
async function registerUser() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registration successful. Please login.");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registration failed");
        }

    } catch (err) {
        console.error("Registration error:", err);
        alert("Registration failed. Check console.");
    }
}

// ====================== LOGIN USER ======================
async function loginUser() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log("LOGIN RESPONSE:", data); // debug

        if (res.ok) {
            // Handle user object safely
            let userObj;
            if (typeof data.user === "string") {
                userObj = JSON.parse(data.user);
            } else {
                userObj = data.user;
            }

            // Store token and seller_id
            localStorage.setItem("token", data.token);
            localStorage.setItem("seller_id", userObj.id);
            localStorage.setItem("user", JSON.stringify(userObj));

            console.log("STORED SELLER_ID:", localStorage.getItem("seller_id")); // debug

            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Login failed");
        }

    } catch (err) {
        console.error("Login error:", err);
        alert("Login failed. Check console.");
    }
}

// ====================== LOGOUT ======================
function logout() {
    console.log("Logout clicked");
    localStorage.removeItem("token");
    localStorage.removeItem("seller_id");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

// ====================== EVENT LISTENERS ======================
// Optional: attach to form submit buttons
document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");

    if (registerBtn) registerBtn.addEventListener("click", registerUser);
    if (loginBtn) loginBtn.addEventListener("click", loginUser);
});