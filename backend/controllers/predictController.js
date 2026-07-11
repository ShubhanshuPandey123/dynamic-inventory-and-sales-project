const { spawn } = require("child_process");

exports.runPrediction = async (req, res) => {
    const { seller_id, product_id, days } = req.body;

    if (!seller_id || !product_id || !days) {
        return res.status(400).json({
            error: "seller_id, product_id, and days are required"
        });
    }

    try {
        // 👇 Start python script WITHOUT passing arguments
        const pyProcess = spawn("python", ["../ml-service/src/predict.py"]);

        let output = "";

        pyProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        pyProcess.stderr.on("data", (data) => {
            console.error("Python error:", data.toString());
        });

      pyProcess.on("close", () => {
    try {
        const parsedData = JSON.parse(output);
        res.json(parsedData);
    } catch (error) {
        console.error("JSON Parse Error:", error);
        res.status(500).json({ error: "Invalid response from ML service" });
    }
});
        // 👇 Send input exactly like typing in terminal
        pyProcess.stdin.write(seller_id + "\n");
        pyProcess.stdin.write(product_id + "\n");
        pyProcess.stdin.write(days.toString() + "\n");
        pyProcess.stdin.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to run prediction" });
    }
};