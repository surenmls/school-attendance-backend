const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (userRes.rows.length === 0) return res.status(401).json({ msg: 'User not found' });

  const user = userRes.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ msg: 'Invalid password' });

  const token = jwt.sign({ id: user.id, role: user.role }, 'secret');
  res.json({ token, user });
});

module.exports = router;
