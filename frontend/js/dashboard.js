// js/dashboard.js

// Fetch and display dashboard summary
async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch dashboard");

        const data = await res.json();

        document.getElementById("totalProducts").innerText = data.totalProducts;
        document.getElementById("totalSales").innerText = data.totalSales;
        document.getElementById("lowStock").innerText = data.lowStock;
    } catch (err) {
        console.error("Dashboard load error:", err);
        alert(err.message);
    }
}

// Initial load
loadDashboard();

// Listen for product updates (from inventory page)
window.addEventListener("storage", (e) => {
    if (e.key === "productUpdated") {
        loadDashboard(); // reload dashboard stats
    }
});
