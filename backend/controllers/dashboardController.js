// backend/controllers/dashboardController.js

const Product = require("../models/Product");
const Sale = require("../models/Sale");

exports.getDashboardSummary = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Count only this user's products
    const totalProducts = await Product.countDocuments({
      seller: sellerId,
    });

    // Count only this user's sales
    const totalSales = await Sale.countDocuments({
      seller: sellerId,
    });

    // Count low stock products for this user only
    const lowStock = await Product.countDocuments({
      seller: sellerId,
      quantity: { $lt: 5 },
    });

    res.json({
      totalProducts,
      totalSales,
      lowStock,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
