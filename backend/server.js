require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth'); // ✅ CHỈ GỌI 1 LẦN
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const brandRoutes = require('./routes/brands');
const contactRoutes = require('./routes/contact');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes); // ✅ Dùng đúng
app.use('/api/users', require('./routes/users'));
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contact', contactRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${process.env.PORT}`);
});
