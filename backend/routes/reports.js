const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/monthly', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { month, year } = req.query;

  try {
    const stmt = db.prepare(`
      SELECT category, SUM(amount) as total_amount, COUNT(*) as count 
      FROM carbon_entries 
      WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
      GROUP BY category
    `);
    const rows = stmt.all(userId, String(month).padStart(2, '0'), year);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
});

router.get('/total', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  try {
    const stmt = db.prepare(
      'SELECT SUM(amount) as total, AVG(amount) as average, COUNT(*) as count FROM carbon_entries WHERE user_id = ?'
    );
    const row = stmt.get(userId);
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
});

router.get('/categories', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  try {
    const stmt = db.prepare(
      'SELECT category, SUM(amount) as total FROM carbon_entries WHERE user_id = ? GROUP BY category'
    );
    const rows = stmt.all(userId);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
