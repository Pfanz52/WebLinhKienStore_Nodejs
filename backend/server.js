require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const brandRoutes = require('./routes/brands');
const contactRoutes = require('./routes/contact');
const cartRoutes = require('./routes/cart'); // ✅ Thêm đúng chỗ

const app = express();

app.use(cors());
app.use(express.json());

// ❗Chỉ gọi 1 lần mỗi route
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);           // ✅ Giữ dòng này
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/cart', cartRoutes);            // ✅ Gọi thêm cart route đúng cách
app.use('/api/categories', require('./routes/categories'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${process.env.PORT}`);
});
