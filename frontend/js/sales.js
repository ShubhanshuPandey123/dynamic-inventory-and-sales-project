
// js/sales.js

// ====================== LOAD PRODUCTS ======================
async function loadProducts() {

    try {

        const res = await fetch(
            `${API_BASE_URL}/products`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        if (!res.ok) {
            throw new Error("Failed to fetch products");
        }

        const products = await res.json();

        const select =
            document.getElementById("productSelect");

        select.innerHTML = "";

        products.forEach(p => {

            const option =
                document.createElement("option");

            option.value = p._id;
            option.textContent = p.name;

            select.appendChild(option);
        });

    } catch (err) {

        console.error(
            "Error loading products:",
            err
        );

        alert("Failed to load products");
    }
}


// ====================== ADD SALE ======================
async function addSale() {

    const productId =
        document.getElementById("productSelect").value;

    const quantity =
        document
            .getElementById("saleQty")
            .value
            .trim();

    if (!productId || !quantity) {

        alert(
            "Please select a product and enter quantity"
        );

        return;
    }

    try {

        const res = await fetch(
            `${API_BASE_URL}/sales`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${localStorage.getItem("token")}`
                },

                body: JSON.stringify({
                    productId,
                    quantity
                })
            }
        );

        if (!res.ok) {

            const data = await res.json();

            throw new Error(
                data.message ||
                "Failed to record sale"
            );
        }

        alert(
            "Sale recorded successfully!"
        );

        document.getElementById(
            "saleQty"
        ).value = "";

    } catch (err) {

        console.error(
            "Error recording sale:",
            err
        );

        alert(err.message);
    }
}


// ====================== PREDICT DEMAND ======================
async function predict(days) {

    const productId =
        document.getElementById(
            "productSelect"
        ).value;

    const sellerId =
        localStorage.getItem("seller_id");

    if (!productId) {

        alert(
            "Please select a product for prediction"
        );

        return;
    }

    if (
        !sellerId ||
        sellerId === "undefined"
    ) {

        alert(
            "Seller ID not found. Please login again."
        );

        return;
    }

    try {

        const res = await fetch(
            `${API_BASE_URL}/predict`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${localStorage.getItem("token")}`
                },

                body: JSON.stringify({

                    seller_id: sellerId,

                    product_id: productId,

                    days: days
                })
            }
        );

        if (!res.ok) {

            const errorData =
                await res.json();

            throw new Error(
                errorData.error ||
                errorData.message ||
                "Prediction failed"
            );
        }

        const data =
            await res.json();


        // ======================
        // DISPLAY RESULT
        // ======================

        document.getElementById(
            "predictionResult"
        ).innerHTML = `

            <strong>
                Predicted Demand (${days} days):
            </strong>

            ${
                data.predicted_total
                    ? Math.round(
                        data.predicted_total
                    )
                    : 0
            }

            <br>

            <strong>
                Current Stock:
            </strong>

            ${data.current_stock ?? 0}

            <br>

            <strong>
                Trend:
            </strong>

            ${data.trend ?? "Unknown"}

            <br>

            <strong>
                Reorder:
            </strong>

            ${
                data.reorder_qty > 0

                ? `
                    <span style="color:red;">
                        Reorder
                        ${data.reorder_qty}
                        units
                    </span>
                  `

                : `
                    <span style="color:green;">
                        Stock is sufficient
                    </span>
                  `
            }
        `;


        // ======================
        // SHOW CHART
        // ======================

        if (
            typeof showPredictionChart ===
            "function"
        ) {

            showPredictionChart(
                data.daily_predictions ?? [],
                days
            );
        }

    } catch (err) {

        console.error(
            "Prediction error:",
            err
        );

        alert(err.message);
    }
}


// ====================== CHART ======================

let predictionChart;


function showPredictionChart(
    predictedDemand,
    days
) {

    const ctx =
        document
            .getElementById(
                "predictionChart"
            )
            .getContext("2d");

    const labels =
        Array.from(
            {
                length: days
            },
            (_, i) =>
                `Day ${i + 1}`
        );

    if (predictionChart) {

        predictionChart.destroy();
    }

    predictionChart = new Chart(
        ctx,
        {

            type: "line",

            data: {

                labels: labels,

                datasets: [{

                    label:
                        "Predicted Demand",

                    data:
                        predictedDemand,

                    borderColor:
                        "#4f46e5",

                    backgroundColor:
                        "rgba(79, 70, 229, 0.2)",

                    fill: true,

                    tension: 0.3
                }]
            },

            options: {

                responsive: true,

                plugins: {

                    legend: {
                        display: true
                    }
                },

                scales: {

                    y: {

                        beginAtZero: true,

                        title: {

                            display: true,

                            text:
                                "Quantity"
                        }
                    },

                    x: {

                        title: {

                            display: true,

                            text:
                                "Days"
                        }
                    }
                }
            }
        }
    );
}


// ====================== DOM LOAD ======================

document.addEventListener(
    "DOMContentLoaded",
    loadProducts
);
