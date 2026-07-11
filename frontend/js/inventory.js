// js/inventory.js

// Fetch and display inventory products
async function fetchInventory() {
    try {
        const res = await fetch(`${API_BASE_URL}/products`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch products");
        }

        const products = await res.json();
        const table = document.getElementById("productTable");

        table.innerHTML = "";
products.forEach(p => {
    table.innerHTML += `
        <tr>
            <td>${p.name}</td>
            <td>${p.category || "-"}</td>
            <td>${p.quantity}</td>
            <td>
                <button onclick="deleteProduct('${p._id}')">
                    Delete
                </button>
            </td>
        </tr>
    `;
});
    } catch (err) {
        console.error("Error fetching inventory:", err);
        alert("Error fetching inventory");
    }
}

// Add a new product
async function addProduct() {
    const name = document.getElementById("pName").value.trim();
    const category = document.getElementById("pCategory").value.trim();
    const quantity = document.getElementById("pStock").value.trim();

    // Basic validation
    if (!name || !quantity) {
        alert("Please enter product name and stock");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ name, category, quantity })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Failed to add product");
        }

        // Clear input fields after successful add
        document.getElementById("pName").value = "";
        document.getElementById("pCategory").value = "";
        document.getElementById("pStock").value = "";

        // Refresh inventory table
        fetchInventory();

        // Notify other pages (dashboard) that product was added
        localStorage.setItem("productUpdated", Date.now());

    } catch (err) {
        console.error("Error adding product:", err);
        alert(err.message);
    }
}
async function deleteProduct(id) {
    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) return;

    try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
        }

        fetchInventory();

        localStorage.setItem("productUpdated", Date.now());

    } catch (err) {
        console.error("Delete product error:", err);
        alert(err.message);
    }
}

// Ensure inventory loads after DOM is ready
document.addEventListener("DOMContentLoaded", fetchInventory);
