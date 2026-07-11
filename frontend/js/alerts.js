// js/alerts.js

async function fetchAlerts() {
    const res = await fetch(`${API_BASE_URL}/alerts`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    const alerts = await res.json();

    const list = document.getElementById("alertList");
    list.innerHTML = "";

    alerts.forEach(a => {
        list.innerHTML += `<li>${a.message}</li>`;
    });
}

fetchAlerts();