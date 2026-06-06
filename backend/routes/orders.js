const express = require("express");

const router = express.Router();

const Order = require("../models/Order");

const { protect } = require("../middleware/authMiddleware");

// CREATE ORDER
router.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      tax,
      total,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No order items",
      });
    }

    const order = await Order.create({
      user: req.user.id,

      items,

      shippingAddress,

      subtotal,

      tax,

      total,

      status: "Processing",
    });

    return res.status(201).json(order);
  } catch (error) {
    console.log("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Server error creating order",
    });
  }
});

// GET USER ORDERS
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    return res.json(orders);
  } catch (error) {
    console.log("GET ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Server error fetching orders",
    });
  }
});

// GET SINGLE ORDER
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json(order);
  } catch (error) {
    console.log("GET ORDER ERROR:", error);

    return res.status(500).json({
      message: "Server error fetching order",
    });
  }
});

module.exports = router;