const express = require('express');
const Brand = require('../models/Brand');
const router = express.Router();

router.get('/', async (req, res) => {
  const brands = await Brand.find();
  res.json(brands);
});

module.exports = router;
