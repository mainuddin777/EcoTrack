const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { CarbonEntry } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { calculateCarbonFootprint, APPLIANCE_RATINGS, TRANSPORT_EMISSIONS } = require('../services/carbonCalculator');

router.get('/appliances', (req, res) => {
  res.json(Object.keys(APPLIANCE_RATINGS));
});

router.get('/transport-types', (req, res) => {
  res.json(Object.keys(TRANSPORT_EMISSIONS));
});

router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const rows = await CarbonEntry.find({ user_id: userId }).sort({ date: -1 });
    res.json(rows);
  } catch (err) {
    console.error('Get entries error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateToken, [
  body('category').notEmpty().isIn(['Energy', 'Transportation', 'Food', 'Waste']),
  body('date').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.userId;
  const { category, date, description } = req.body;
  const entryDate = date ? new Date(date) : new Date();

  try {
    let amount = 0;
    let source = '';

    if (category === 'Energy') {
      const { applianceName, powerWatts, hoursUsed, daysUsed, energySource } = req.body;
      
      if (!applianceName && !powerWatts) {
        return res.status(400).json({ error: 'Appliance name or power watts required for Energy category' });
      }

      if (!hoursUsed) {
        return res.status(400).json({ error: 'Hours used required for Energy category' });
      }

      const power = powerWatts || APPLIANCE_RATINGS[applianceName]?.power;
      if (!power) {
        return res.status(400).json({ error: 'Appliance not found or power rating not provided' });
      }

      amount = calculateCarbonFootprint('Energy', {
        powerWatts: power,
        hoursUsed: parseFloat(hoursUsed),
        daysUsed: daysUsed ? parseFloat(daysUsed) : 1,
        energySource: energySource || 'GRID_AVERAGE'
      });
      source = applianceName || `${powerWatts}W appliance`;

    } else if (category === 'Transportation') {
      const { transportType, distance } = req.body;
      
      if (!transportType || !distance) {
        return res.status(400).json({ error: 'Transport type and distance required' });
      }

      amount = calculateCarbonFootprint('Transportation', {
        transportType,
        distance: parseFloat(distance)
      });
      source = transportType;

    } else if (category === 'Food') {
      const { foodType, quantity } = req.body;
      
      if (!foodType || !quantity) {
        return res.status(400).json({ error: 'Food type and quantity required' });
      }

      amount = calculateCarbonFootprint('Food', {
        foodType,
        quantity: parseFloat(quantity)
      });
      source = foodType;

    } else if (category === 'Waste') {
      const { quantityKg } = req.body;
      
      if (!quantityKg) {
        return res.status(400).json({ error: 'Quantity in kg required for Waste category' });
      }

      amount = calculateCarbonFootprint('Waste', {
        quantityKg: parseFloat(quantityKg)
      });
      source = 'Waste disposal';
    }

    const newEntry = new CarbonEntry({
      user_id: userId,
      category,
      amount,
      unit: 'kg CO2',
      description: description || source,
      date: entryDate,
      source
    });
    
    const result = await newEntry.save();
    
    res.status(201).json({ 
      id: result._id, 
      message: 'Entry added successfully',
      calculatedAmount: amount,
      unit: 'kg CO2'
    });
  } catch (err) {
    console.error('Add entry error:', err);
    return res.status(500).json({ error: 'Failed to add entry', details: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const entryId = req.params.id;

  try {
    await CarbonEntry.deleteOne({ _id: entryId, user_id: userId });
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Delete entry error:', err);
    return res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
