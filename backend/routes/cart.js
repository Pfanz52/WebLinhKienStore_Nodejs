const express = require('express');
const Cart = require('../models/Cart');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// GET giỏ hàng người dùng
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const cart = await Cart.findOne({ userId });
    res.json(cart?.items || []);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tải giỏ hàng', error: err.message });
  }
});

// POST cập nhật giỏ hàng
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items },
      { upsert: true, new: true }
    );

    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lưu giỏ hàng', error: err.message });
  }
});

module.exports = router;
