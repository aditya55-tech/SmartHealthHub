const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    id: { type: Number }, // Keep original numeric ID for substitute references
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    stock: { type: Number, required: true },
    rating: { type: Number, default: 4.0 },
    reviews: { type: Number, default: 0 },
    image: { type: String, default: "" },
    prescription: { type: Boolean, default: false },
    substitutes: { type: Array, default: [] },
    description: { type: String, default: "" },
    dosage: { type: String, default: "" },
    sideEffects: { type: String, default: "" },
    manufacturer: { type: String, default: "Unknown" },
    expiryDate: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
