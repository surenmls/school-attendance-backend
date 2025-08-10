// backend/routes/userRoutes.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all users (optional filter by role)
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT * FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add user (student/teacher)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, class_name } = req.body;
    const hashedPassword = password; // 🔐 hash it later

    const query = `
      INSERT INTO users (name, email, password, role, class_name, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`;
    const values = [name, email, hashedPassword, role, class_name];

    const { rows } = await db.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
