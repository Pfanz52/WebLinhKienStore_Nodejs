const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/authMiddleware'); 


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});


// 📌 Route đăng ký người dùng
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// 📌 Route đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng' });

    // Tạo JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: '7d',
    });

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
// 📌 Quên mật khẩu - gửi email
// router.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

//     // Tạo mã xác nhận (giả lập)
//     const code = Math.floor(100000 + Math.random() * 900000); // 6 chữ số

//     // Gửi mail
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_SENDER, // tài khoản gửi
//         pass: process.env.EMAIL_PASSWORD, // mật khẩu ứng dụng
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.EMAIL_SENDER,
//       to: email,
//       subject: 'Mã khôi phục mật khẩu - Linh Kiện Store',
//       text: `Mã xác nhận của bạn là: ${code}`,
//     });

//     res.json({ message: 'Mã xác nhận đã được gửi qua email!' });
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi khi gửi email', error: err.message });
//   }
// });
// routes/auth.js


let resetTokens = {}; // Lưu tạm thời mã token reset trong RAM

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    const token = crypto.randomBytes(20).toString('hex');
    resetTokens[token] = { email, expires: Date.now() + 15 * 60 * 1000 };

    const resetLink = `http://localhost:3000/reset-password/${token}`;
    console.log('✅ Đường dẫn reset:', resetLink);

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `<p>Nhấn vào <a href="${resetLink}">đây</a> để đặt lại mật khẩu.</p>`,
    });

    res.json({ message: 'Đã gửi email khôi phục mật khẩu' });

  } catch (err) {
    console.error('❌ Lỗi gửi email:', err); // 👉 Xem rõ lỗi
    res.status(500).json({ message: 'Lỗi gửi email', error: err.message });
  }
});

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
    delete resetTokens[token]; // xoá token sau khi sử dụng
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});
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
