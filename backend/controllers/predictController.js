const axios = require("axios");

exports.runPrediction = async (req, res) => {
    const { seller_id, product_id, days } = req.body;

    if (!seller_id || !product_id || !days) {
        return res.status(400).json({
            error: "seller_id, product_id, and days are required"
        });
    }

    try {
        const response = await axios.post(
            `${process.env.ML_SERVICE_URL}/predict`,
            {
                seller_id,
                product_id,
                days
            }
        );

        return res.json(response.data);

    } catch (error) {
    console.error(
        "ML Service Error:",
        error.response?.data || error.message
    );

    return res.status(500).json({
        error: error.response?.data || error.message
    });
}
};