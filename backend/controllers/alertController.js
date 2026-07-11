const Product = require("../models/Product");

exports.getAlerts = async (req, res) => {
  try {
    // Get products with quantity < 10 for the logged-in seller
    const lowStockProducts = await Product.find({ 
      quantity: { $lt: 5 },
      seller: req.user.id   
    });

    // Create a message for each product
    const alerts = lowStockProducts.map(p => ({
      message: `${p.name} is low in stock (${p.quantity} left)`
    }));

    res.json(alerts);
  } catch (err) {
    console.error("Get alerts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};