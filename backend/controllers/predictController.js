
const axios = require("axios");

exports.runPrediction = async (req, res) => {

    const { seller_id, product_id, days } = req.body;

    // Check required fields
    if (!seller_id || !product_id || !days) {
        return res.status(400).json({
            error: "seller_id, product_id, and days are required"
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

        console.log("Prediction received from ML service");

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