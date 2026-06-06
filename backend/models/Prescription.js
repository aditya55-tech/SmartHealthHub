const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    notes: { type: String, default: "" },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
