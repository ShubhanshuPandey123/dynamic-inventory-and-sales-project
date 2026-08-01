
const axios = require("axios");

const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

exports.runPrediction = async (req, res) => {

    console.log(
        "🔥 runPrediction CALLED",
        new Date().toISOString()
    );

    const { seller_id, product_id, days } = req.body;

    if (!seller_id || !product_id || !days) {
        return res.status(400).json({
            error: "seller_id, product_id, and days are required"
        });
    }

    const ML_URL = process.env.ML_SERVICE_URL;

    try {

        console.log("ML Service:", ML_URL);
        console.log("Waking ML service...");

        let serviceReady = false;

        // STEP 1: Wake up ML service
        for (let attempt = 1; attempt <= 18; attempt++) {

            try {

                console.log(
                    `Wake-up attempt ${attempt}/18`
                );

                await axios.get(ML_URL, {
                    timeout: 15000
                });

                serviceReady = true;

                console.log(
                    "✅ ML service is awake!"
                );

                break;

            } catch (error) {

                console.log(
                    "========== WAKE ERROR =========="
                );

                console.log(
                    "STATUS:",
                    error.response?.status
                );

                console.log(
                    "DATA:",
                    error.response?.data
                );

                console.log(
                    "MESSAGE:",
                    error.message
                );

                console.log(
                    "CODE:",
                    error.code
                );

                console.log(
                    "================================"
                );

                console.log(
                    "ML service not ready. Waiting 10 seconds..."
                );

                await sleep(10000);
            }
        }

        // ML service never became ready
        if (!serviceReady) {

            console.log(
                "❌ ML service could not be started"
            );

            return res.status(503).json({
                error:
                    "ML service could not be started. Please try again."
            });
        }

        // STEP 2: Send prediction request
        console.log(
            "🚀 Sending prediction request..."
        );

        const response = await axios.post(
            `${ML_URL}/predict`,
            {
                seller_id,
                product_id,
                days
            },
            {
                timeout: 180000
            }
        );

        console.log(
            "✅ Prediction received from ML service"
        );

        return res.json(response.data);

    } catch (error) {

        console.error(
            "❌ ML Service Prediction Error"
        );

        console.log(
            "STATUS:",
            error.response?.status
        );

        console.log(
            "DATA:",
            error.response?.data
        );

        console.log(
            "URL:",
            error.config?.url
        );

        console.log(
            "MESSAGE:",
            error.message
        );

        console.log(
            "CODE:",
            error.code
        );

        return res.status(500).json({
            error:
                error.response?.data ||
                error.message
        });
    }
};
