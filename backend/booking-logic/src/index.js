require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use((req, res, next) => {
  const dateTime = new Date().toISOString();
  const logItem = `${dateTime}\t${req.method}\t${req.url}\t${req.headers.origin}\n`
  if (!req.url.includes('/health'))
    console.log(logItem);
  next();
});
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'business-service' });
});

// Routes
app.use('/api/business', bookingRoutes);

app.get("/openapi.json", (req, res) => {
  const specPath = path.join(__dirname, "openapi.json");
  const spec = fs.readFileSync(specPath, "utf-8");
  res.type("application/json").send(spec);
});

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('json')) {
        res.json({ message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

// Error handling middleware
app.use((err, req, res, next) => {
	const dateTime = new Date().toISOString();
	const logItem = `${dateTime}\t${req.method}\t${req.url}\t${req.headers.origin}\n`
	console.log(logItem);
	console.error(err.stack);

	res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Business Service running on port ${PORT}`);
});
