
const axios = require("axios");

// ==========================================
// WAKE ML SERVICE
// ==========================================
exports.wakeMLService = async (req, res) => {

    const ML_URL = process.env.ML_SERVICE_URL;

    if (!ML_URL) {
        return res.status(500).json({
            error: "ML_SERVICE_URL is not configured"
        });
    }

    try {

        console.log("Waking ML service...");
        console.log("ML URL:", ML_URL);

        const response = await axios.get(ML_URL, {
            timeout: 15000
        });

        console.log(
            "ML service response:",
            response.status
        );

        return res.status(200).json({
            success: true,
            ready: true,
            message: "ML service is awake"
        });

    } catch (error) {

        console.log(
            "ML wake status:",
            error.response?.status
        );

        // Render is still waking the service
        if (error.response?.status === 429) {

            return res.status(202).json({
                success: false,
                ready: false,
                waking: true,
                message: "ML service is still waking up"
            });
        }

        return res.status(202).json({
            success: false,
            ready: false,
            waking: true,
            message: "ML service is waking up"
        });
    }
};


// ==========================================
// RUN PREDICTION
// ==========================================
exports.runPrediction = async (req, res) => {

    const {
        seller_id,
        product_id,
        days
    } = req.body;

    if (!seller_id || !product_id || !days) {

        return res.status(400).json({
            error:
                "seller_id, product_id, and days are required"
        });
    }

    try {

        console.log(
            "Calling ML Service:",
            process.env.ML_SERVICE_URL
        );

        const response = await axios.post(
            `${process.env.ML_SERVICE_URL}/predict`,
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
            "Prediction received from ML service"
        );

        return res.json(response.data);

    } catch (error) {

        console.error("ML Service Error");

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

        return res.status(500).json({
            error:
                error.response?.data ||
                error.message
        });
    }
};

