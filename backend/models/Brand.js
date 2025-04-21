const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: String,
  image: String,
});

module.exports = mongoose.model('Brand', brandSchema);
