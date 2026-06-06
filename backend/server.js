const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const seedMedicines = require("./seed/medicinesSeed");

// Routes
const authRoutes = require("./routes/auth");
const medicineRoutes = require("./routes/medicines");
const orderRoutes = require("./routes/orders");
const profileRoutes = require("./routes/profile");
const prescriptionRoutes = require("./routes/prescriptions");
const paymentRoutes = require("./routes/payment");

// Middleware
const { protect } = require("./middleware/authMiddleware");

// Models
const User = require("./models/User");

const app = express();

const PORT = process.env.PORT || 7000;

// ======================
// CONNECT DATABASE
// ======================
connectDB()
  .then(async () => {
    console.log("MongoDB connected");

    try {
      await seedMedicines();
      console.log("Medicines seeded successfully!");
    } catch (error) {
      console.log("Medicine seed error:", error);
    }
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

// ======================
// MIDDLEWARES
// ======================
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ======================
// STATIC UPLOADS
// ======================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ======================
// HEALTH ROUTE
// ======================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "MediNest Backend Running",
  });
});

// ======================
// API ROUTES
// ======================
app.use("/api/auth", authRoutes);

app.use("/api/medicines", medicineRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/payment", paymentRoutes);

// ======================
// CART ROUTES
// ======================

// GET CART
app.get("/api/cart", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      items: user.cart || [],
    });
  } catch (error) {
    console.log("Fetch cart error:", error);

    return res.status(500).json({
      message: "Server error fetching cart",
    });
  }
});

// ADD TO CART
app.post("/api/cart/add", protect, async (req, res) => {
  try {
    const {
      medicineId,
      name,
      brand,
      price,
      image,
      prescription,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const existingItem = user.cart.find(
      (item) => item.medicineId === Number(medicineId)
    );

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      user.cart.push({
        medicineId: Number(medicineId),
        name,
        brand: brand || "",
        price: Number(price),
        image: image || "",
        prescription: !!prescription,
        qty: 1,
      });
    }

    await user.save();

    return res.json({
      items: user.cart,
    });
  } catch (error) {
    console.log("Add cart error:", error);

    return res.status(500).json({
      message: "Server error adding item",
    });
  }
});

// UPDATE CART
app.put("/api/cart/update", protect, async (req, res) => {
  try {
    const { medicineId, qty } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingItem = user.cart.find(
      (item) => item.medicineId === Number(medicineId)
    );

    if (existingItem) {
      existingItem.qty = Number(qty);
    }

    await user.save();

    return res.json({
      items: user.cart,
    });
  } catch (error) {
    console.log("Update cart error:", error);

    return res.status(500).json({
      message: "Server error updating cart",
    });
  }
});

// REMOVE ITEM
app.delete("/api/cart/remove/:medicineId", protect, async (req, res) => {
  try {
    const { medicineId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.cart = user.cart.filter(
      (item) => item.medicineId !== Number(medicineId)
    );

    await user.save();

    return res.json({
      items: user.cart,
    });
  } catch (error) {
    console.log("Remove cart error:", error);

    return res.status(500).json({
      message: "Server error removing item",
    });
  }
});

// CLEAR CART
app.delete("/api/cart/clear", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.cart = [];

    await user.save();

    return res.json({
      items: [],
    });
  } catch (error) {
    console.log("Clear cart error:", error);

    return res.status(500).json({
      message: "Server error clearing cart",
    });
  }
});

// ======================
// DEFAULT ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("MediNest Backend API Running");
});

// ======================
// START SERVER
// ======================
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});