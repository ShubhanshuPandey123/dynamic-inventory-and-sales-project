
const express = require("express");

const router = express.Router();

const {
    runPrediction,
    wakeMLService
} = require("../controllers/predictController");

// Wake ML service
router.get("/wake-ml", wakeMLService);

// Existing prediction route
router.post("/", runPrediction);

module.exports = router;
