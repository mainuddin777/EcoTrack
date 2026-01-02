const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

console.log('Environment loaded. JWT_SECRET is', process.env.JWT_SECRET ? 'set' : 'NOT SET - THIS WILL CAUSE ISSUES');

const authRoutes = require('./routes/auth');
const carbonRoutes = require('./routes/carbon');
const reportRoutes = require('./routes/reports');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, 'localhost', () => {
  console.log(`EcoTrack server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
