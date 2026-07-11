const Product = require("../models/Product");

// ================= GET PRODUCTS =================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });
    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= ADD PRODUCT / RESTOCK =================
exports.addProduct = async (req, res) => {
  try {
    const { name, quantity, category } = req.body;

    if (!name || !quantity) {
      return res.status(400).json({
        message: "Name and quantity are required",
      });
    }

    const qty = parseInt(quantity);

  
    let product = await Product.findOne({
      name: name,
      seller: req.user.id,
    });

    if (product) {
  
      product.quantity += qty;

      if (category) {
        product.category = category;
      }

      await product.save();

      return res.json({
        message: "Product stock updated",
        product,
      });
    }


    product = new Product({
      name,
      quantity: qty,
      category: category || "-",
      seller: req.user.id,
    });

    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= UPDATE PRODUCT =================
exports.updateProduct = async (req, res) => {
  try {
    const { name, quantity, category } = req.body;

    const updatedData = {};

    if (name) updatedData.name = name;
    if (category) updatedData.category = category;

    if (quantity !== undefined) {
      updatedData.quantity = parseInt(quantity);
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        seller: req.user.id,
      },
      updatedData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= DELETE PRODUCT =================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};