require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.MAIL_USER,
  to: 'your_email@gmail.com',
  subject: 'Test email thành công',
  text: 'Xin chào! Đây là test từ hệ thống Linh Kiện Store!',
}).then(() => {
  console.log('✅ Email đã được gửi thành công!');
}).catch((err) => {
  console.error('❌ Gửi email lỗi:', err);
});
