// routes/categories.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const categories = [
    'IC Chức Năng',
    'Module',
    'Cảm Biến',
    'Nguồn',
    'LED - Chiếu Sáng',
  ];
  res.json(categories);
});

module.exports = router;
