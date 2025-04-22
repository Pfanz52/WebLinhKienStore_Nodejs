const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/authMiddleware');

// ✅ Cấu hình email gửi bằng Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// 📌 Đăng ký người dùng
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã tồn tại' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });

    await user.save();
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// 📌 Đăng nhập người dùng
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng' });

    // ✅ Token chứa đầy đủ thông tin user
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// 📌 Quên mật khẩu - gửi email kèm link reset
let resetTokens = {}; // lưu tạm thời trong RAM

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    const token = crypto.randomBytes(20).toString('hex');
    resetTokens[token] = { email, expires: Date.now() + 15 * 60 * 1000 };

    const link = `http://localhost:3000/reset-password/${token}`;
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: '🔐 Đặt lại mật khẩu - Linh Kiện Store',
      html: `<p>Nhấn vào <a href="${link}">đây</a> để đặt lại mật khẩu. Link hết hạn sau 15 phút.</p>`,
    });

    res.json({ message: 'Đã gửi email khôi phục mật khẩu' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi gửi email', error: err.message });
  }
});

// 📌 Đặt lại mật khẩu
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const data = resetTokens[token];
  if (!data || data.expires < Date.now()) {
    return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ email: data.email }, { password: hashed });
    delete resetTokens[token];

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// 📌 Đổi mật khẩu (phải đăng nhập)
router.put('/update-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: '✅ Đã đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
