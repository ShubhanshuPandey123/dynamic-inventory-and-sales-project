const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getSales,
  addSale
} = require("../controllers/salesController");

router.use(authMiddleware);

router.get("/", getSales);
router.post("/", addSale);

module.exports = router;
