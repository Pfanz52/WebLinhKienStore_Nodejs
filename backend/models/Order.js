const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: { type: String, required: true }, // ✅ THÊM DÒNG NÀY
  phone: String,
  province: String,
  district: String,
  ward: String,
  addressDetail: String,
  note: String,
  products: [
    {
      _id: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    }
  ],
  total: Number,
  paymentMethod: String,
  status: { type: String, default: 'Chờ xác nhận' },
  shippingProvider: { type: String, default: 'Giao hàng nhanh' },
  estimatedDelivery: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
