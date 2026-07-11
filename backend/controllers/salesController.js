// controllers/salesController.js
const Sale = require("../models/Sale");
const Product = require("../models/Product");

// Get all sales
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate("product", "name price");
    res.json(sales);
  } catch (err) {
    console.error("Get sales error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a new sale
exports.addSale = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product and quantity are required" });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check stock
    if (qty > product.quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    // Deduct stock
    product.quantity -= qty;
    await product.save();
// Create sale record
const sale = new Sale({
  product: productId,
  quantity: qty,
  totalPrice: qty * (product.price || 0),
  seller: req.user.id,
  date: new Date()
});

await sale.save();
    await sale.save();

    res.status(201).json(sale);

  } catch (err) {
    console.error("Add sale error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
