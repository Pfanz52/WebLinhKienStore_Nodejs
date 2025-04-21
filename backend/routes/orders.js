const express = require('express');
const Order = require('../models/Order');
const { sendOrderEmail } = require('../utils/mailer');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// 📌 Lấy đơn hàng của người dùng hiện tại (đã đăng nhập)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng', error: err.message });
  }
});

// 📌 Tạo đơn hàng mới
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name, email, phone, province, district, ward,
      addressDetail, note, paymentMethod, voucher, products, total
    } = req.body;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3); // giao sau 3 ngày

    const newOrder = new Order({
      userId: req.user.id, // lấy từ middleware xác thực
      name,
      email,
      phone,
      province,
      district,
      ward,
      addressDetail,
      note,
      paymentMethod,
      voucher,
      products,
      total,
      status: 'Chờ xác nhận',
      shippingProvider: 'Giao hàng nhanh',
      estimatedDelivery,
      createdAt: new Date()
    });

    await newOrder.save();

    // 📬 Gửi email xác nhận đơn hàng
    await sendOrderEmail(email, {
      name,
      phone,
      province,
      district,
      ward,
      addressDetail,
      note,
      paymentMethod,
      total,
      products
    });

    res.status(201).json({ message: 'Đặt hàng thành công', order: newOrder });
  } catch (err) {
    console.error('❌ SERVER ERROR:', err);
    res.status(500).json({ message: 'Lỗi đặt hàng', error: err.message });
  }
});

// 📌 Hủy đơn nếu chưa quá 2h và chưa được xác nhận
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });

    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    if (order.status !== 'Chờ xác nhận') {
      return res.status(400).json({ message: 'Không thể hủy đơn đã xác nhận hoặc đang giao' });
    }

    const now = new Date();
    const diffInHours = (now - new Date(order.createdAt)) / (1000 * 60 * 60);
    if (diffInHours > 2) {
      return res.status(400).json({ message: 'Đã quá thời gian cho phép hủy đơn (2 giờ)' });
    }

    order.status = 'Đã hủy';
    await order.save();

    res.json({ message: 'Đơn hàng đã được hủy thành công', order });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi hủy đơn hàng', error: err.message });
  }
});

module.exports = router;
