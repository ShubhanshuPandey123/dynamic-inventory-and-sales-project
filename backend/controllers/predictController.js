const axios = require("axios");

exports.runPrediction = async (req, res) => {
    const { seller_id, product_id, days } = req.body;

    if (!seller_id || !product_id || !days) {
        return res.status(400).json({
            error: "seller_id, product_id, and days are required"
        });
    }

    try {
        // console.log("Waking up ML service...");

        // await axios.get(
        //     `${process.env.ML_SERVICE_URL}/`,
        //     {
        //         timeout: 180000
        //     }
        // );

        // console.log("ML service is awake");

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

 }
    //  catch (error) {
    //     console.error(
    //         "ML Service Error:",
    //         error.response?.data || error.message
    //     );
    catch (error) {
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("URL:", error.config?.url);
    console.log("MESSAGE:", error.message);

    return res.status(500).json({
        error: error.response?.data || error.message
    });
}

        return res.status(500).json({
            error: error.response?.data || error.message
        });
    }
};