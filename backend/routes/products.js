// const express = require('express');
// const router = express.Router();
// const Product = require('../models/Product');

// // GET /api/products?category=...&brand=...
// router.get('/', async (req, res) => {
//   const { category, brand } = req.query;

//   let filter = {};
//   if (category) filter.category = { $regex: new RegExp(category, 'i') };
//   if (brand) filter.brand = { $regex: new RegExp(brand, 'i') };

//   try {
//     const products = await Product.find(filter);
//     res.json({ products });
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi server', error: err.message });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  const { category, brand, page = 1, limit = 12 } = req.query;

  const filter = {};
  if (category) filter.category = { $regex: new RegExp(category, 'i') };
  if (brand) filter.brand = { $regex: new RegExp(brand, 'i') };

  try {
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total }); // 👈 KHÔNG được res.json(products) đơn thuần
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});
// API lấy toàn bộ sản phẩm (không phân trang) cho Products.jsx
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});
// routes/products.js
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // hoặc findOne({ slug: req.params.slug })
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
