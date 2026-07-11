// backend/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboardSummary } = require("../controllers/dashboardController");

router.use(authMiddleware);

// GET /api/dashboard/summary
router.get("/summary", getDashboardSummary);

module.exports = router;
