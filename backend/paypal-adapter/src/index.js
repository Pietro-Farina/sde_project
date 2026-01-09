require('dotenv').config();

const express = require('express');
const cors = require('cors');
// const corsOptions = require('./config/corsOptions')
const routes = require('./routes'); // Import the combined router from routes/index.js

const app = express();
const PORT = process.env.PORT || 3003;

// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'paypal-adapter' });
});

// Routes
app.use('/api/paypal', routes);

// 404 handler
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