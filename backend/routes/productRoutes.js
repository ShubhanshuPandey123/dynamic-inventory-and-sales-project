const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// Protect all product routes
router.use(authMiddleware);

router.get("/", getProducts);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
