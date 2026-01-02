const express = require('express');
const router = express.Router();
const { CarbonEntry } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/monthly', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { month, year } = req.query;

  try {
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

    const rows = await CarbonEntry.aggregate([
      {
        $match: {
          user_id: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total_amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
});

router.get('/total', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const rows = await CarbonEntry.aggregate([
      {
        $match: { user_id: userId }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          average: { $avg: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    const row = rows[0] || { total: 0, average: 0, count: 0 };
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
});

router.get('/categories', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const rows = await CarbonEntry.aggregate([
      {
        $match: { user_id: userId }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
