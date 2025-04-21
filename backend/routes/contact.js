const express = require('express');
const Contact = require('../models/Contact');
const { sendContactReply } = require('../utils/mailer');


const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    await sendContactReply(email, name);

    res.status(201).json({ message: 'Gửi liên hệ thành công' });
  } catch (err) {
    console.error('❌ Lỗi liên hệ:', err);
    res.status(500).json({ message: 'Không thể gửi liên hệ', error: err.message });
  }
});

module.exports = router;
