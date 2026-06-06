const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/profile
// @desc    Get user profile details
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Dynamic stats: count orders and calculate total spent from MongoDB
    const orders = await Order.find({ user: req.user.id });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    // Return profile data with dynamic stats added
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      dob: user.dob || "",
      gender: user.gender || "",
      addresses: user.addresses || [],
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      joinedDate: new Date(user.createdAt).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
      totalOrders,
      totalSpent
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error retrieving profile" });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile details
// @access  Private
router.put("/", protect, async (req, res) => {
  const { name, phone, dob, gender, addresses } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update personal fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;
    
    // Support address array updates
    if (addresses !== undefined) user.addresses = addresses;

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      dob: updatedUser.dob,
      gender: updatedUser.gender,
      addresses: updatedUser.addresses,
      isAdmin: updatedUser.isAdmin
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error updating profile" });
  }
});

// @route   PUT /api/profile/password
// @desc    Update user password
// @access  Private
router.put("/password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please enter current and new passwords" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    return res.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({ message: "Server error updating password" });
  }
});

module.exports = router;
