const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" }
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Alias for convenience
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    delivery: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "UPI" },
    shippingAddress: { type: String, required: true },
    address: { type: String }, // Alias to remain completely compatible
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered"],
      default: "Pending"
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Pre-save middleware to synchronize aliases
orderSchema.pre("save", function (next) {
  if (this.user && !this.userId) {
    this.userId = this.user;
  }
  if (this.shippingAddress && !this.address) {
    this.address = this.shippingAddress;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
