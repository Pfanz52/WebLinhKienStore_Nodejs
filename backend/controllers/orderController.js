// backend/controllers/orderController.js

const nodemailer = require('nodemailer');

async function sendOrderEmail(order) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your_email@gmail.com',
      pass: 'your_app_password'
    }
  });

  const mailOptions = {
    from: '"Linh Kiện Store" <your_email@gmail.com>',
    to: order.email,
    subject: 'Xác nhận đơn hàng',
    html: `
      <h3>Xin chào ${order.name},</h3>
      <p>Đơn hàng của bạn đã được đặt thành công!</p>
      <p><b>Tổng tiền:</b> ${order.total.toLocaleString()} VNĐ</p>
      <p>Cảm ơn bạn đã mua hàng tại Linh Kiện Store ❤️</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOrderEmail };
