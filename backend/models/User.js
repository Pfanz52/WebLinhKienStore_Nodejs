const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false },

  // 🔐 Thêm để hỗ trợ quên mật khẩu
  resetCode: String,
  resetCodeExpires: Date,
});

module.exports = mongoose.model('User', userSchema);
