const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. Home, Work
  line: { type: String, required: true },
  default: { type: Boolean, default: false }
});

const cartItemSchema = new mongoose.Schema({
  medicineId: { type: Number, required: true },
  name: { type: String, required: true },
  brand: { type: String, default: "" },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  prescription: { type: Boolean, default: false },
  qty: { type: Number, default: 1 }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    addresses: [addressSchema],
    cart: [cartItemSchema],
    isAdmin: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("User", userSchema);

