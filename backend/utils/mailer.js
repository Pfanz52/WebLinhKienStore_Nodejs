const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendOrderEmail = async (to, order) => {
  const productRows = order.products.map(p => `
    <tr>
      <td>
        <img src="${p.image.startsWith('http') ? p.image : `https://yourdomain.com/${p.image}`}" 
             alt="${p.name}" width="60" style="border-radius: 4px; border: 1px solid #ddd;" />
      </td>
      <td>${p.name}</td>
      <td>${p.price.toLocaleString('vi-VN')} VNĐ</td>
      <td>${p.quantity}</td>
      <td>${(p.price * p.quantity).toLocaleString('vi-VN')} VNĐ</td>
    </tr>
  `).join('');

  const htmlContent = `
    <h2>🧾 Xác nhận đơn hàng từ Linh Kiện Store</h2>
    <p><strong>Khách hàng:</strong> ${order.name}</p>
    <p><strong>Điện thoại:</strong> ${order.phone}</p>
    <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
    <p><strong>Nội dung chuyển khoản:</strong> ${order.orderCode}</p>
    <p><strong>Địa chỉ:</strong> ${order.addressDetail}, ${order.ward}, ${order.district}, ${order.province}</p>
    <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</p>

    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center; margin-top: 20px;">
      <thead style="background-color: #f5f5f5;">
        <tr>
          <th>Ảnh</th>
          <th>Tên sản phẩm</th>
          <th>Giá</th>
          <th>Số lượng</th>
          <th>Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${productRows}
      </tbody>
    </table>

    <p style="text-align: right; font-weight: bold; margin-top: 10px;">
      Tổng cộng: ${order.total.toLocaleString('vi-VN')} VNĐ
    </p>

    <p style="margin-top: 30px;">🎉 Cảm ơn bạn đã mua hàng tại <strong>Linh Kiện Store</strong>!</p>
  `;

  await transporter.sendMail({
    from: `Linh Kiện Store <${process.env.MAIL_USER}>`,
    to,
    subject: '🧾 Xác nhận đơn hàng của bạn',
    html: htmlContent,
  });
};

const sendContactReply = async (to, name) => {
  const htmlContent = `
    <h3>📩 Xin chào ${name},</h3>
    <p>Chúng tôi đã nhận được liên hệ của bạn. Cảm ơn bạn đã phản hồi!</p>
    <p>🧾 Thông tin của bạn đã được lưu lại, chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
    <p>Trân trọng,<br/><strong>Đội ngũ Linh Kiện Store</strong></p>
  `;

  await transporter.sendMail({
    from: `Linh Kiện Store <${process.env.MAIL_USER}>`,
    to,
    subject: '📩 Xác nhận phản hồi từ Linh Kiện Store',
    html: htmlContent,
  });
};

// ✅ Export cả 2 hàm
module.exports = {
  sendOrderEmail,
  sendContactReply
};
