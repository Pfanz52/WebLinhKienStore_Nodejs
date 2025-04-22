// models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  items: [
    {
      _id: String, // product id
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);
