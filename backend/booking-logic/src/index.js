require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'business-service' });
});

// Routes
app.use('/api/business/bookings', bookingRoutes);

app.listen(PORT, () => {
  console.log(`Business Service running on port ${PORT}`);
});
