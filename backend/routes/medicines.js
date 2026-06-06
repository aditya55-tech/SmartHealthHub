const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");
const { protect, admin } = require("../middleware/authMiddleware");

// @route   GET /api/medicines
// @desc    Get all medicines
// @access  Public
router.get("/", async (req, res) => {
  try {
    const medicines = await Medicine.find({}).sort({ createdAt: -1 });
    return res.json(medicines);
  } catch (error) {
    console.error("Get medicines error:", error);
    return res.status(500).json({ message: "Server error retrieving medicines" });
  }
});

// @route   GET /api/medicines/:id
// @desc    Get a single medicine by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    return res.json(medicine);
  } catch (error) {
    console.error("Get medicine error:", error);
    // If invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Medicine not found" });
    }
    return res.status(500).json({ message: "Server error retrieving medicine details" });
  }
});

// @route   POST /api/medicines
// @desc    Create a new medicine
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  const { name, brand, category, price, stock, description } = req.body;

  try {
    if (!name || !brand || !category || price == null || stock == null) {
      return res.status(400).json({ message: "Missing required medicine fields" });
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);

    const newMedicine = new Medicine({
      id: Date.now(), // Generate numeric ID for fallback/substitute purposes
      name,
      brand,
      category,
      price: priceNum,
      originalPrice: priceNum,
      stock: stockNum,
      rating: 4.0,
      reviews: 0,
      image: `https://placehold.co/280x200/dbeafe/1d4ed8?text=${encodeURIComponent(name)}`,
      prescription: false,
      substitutes: [],
      description: description || "",
      dosage: "As directed by the physician",
      sideEffects: "Consult a doctor if side effects occur",
      manufacturer: brand,
      expiryDate: "2026-12"
    });

    const created = await newMedicine.save();
    return res.status(201).json(created);
  } catch (error) {
    console.error("Create medicine error:", error);
    return res.status(500).json({ message: "Server error creating medicine" });
  }
});

// @route   DELETE /api/medicines/:id
// @desc    Delete a medicine
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const deleted = await Medicine.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Delete medicine error:", error);
    return res.status(500).json({ message: "Server error deleting medicine" });
  }
});

module.exports = router;
