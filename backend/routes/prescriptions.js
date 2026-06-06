const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Prescription = require("../models/Prescription");
const { protect, admin } = require("../middleware/authMiddleware");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (allow images and PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (JPG, PNG) and PDFs are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// @route   POST /api/prescriptions
// @desc    Upload a new prescription
// @access  Private (Registered User)
router.post("/", protect, upload.single("prescription"), async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a prescription file" });
    }

    const prescription = new Prescription({
      name,
      email,
      phone: phone || "",
      notes: notes || "",
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`, // Servable static path
      status: "Pending"
    });

    const saved = await prescription.save();
    return res.status(201).json(saved);
  } catch (error) {
    console.error("Prescription upload error:", error);
    return res.status(500).json({ message: error.message || "Server error uploading prescription" });
  }
});

// @route   GET /api/prescriptions
// @desc    Get all prescriptions (Admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({}).sort({ createdAt: -1 });
    return res.json(prescriptions);
  } catch (error) {
    console.error("Get prescriptions error:", error);
    return res.status(500).json({ message: "Server error retrieving prescriptions" });
  }
});

// @route   PUT /api/prescriptions/:id
// @desc    Update prescription status
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  const { status } = req.body;

  try {
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    prescription.status = status;
    const updated = await prescription.save();
    return res.json(updated);
  } catch (error) {
    console.error("Update prescription status error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Prescription not found" });
    }
    return res.status(500).json({ message: "Server error updating prescription status" });
  }
});

module.exports = router;
