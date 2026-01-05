const express = require("express");
const cors = require("cors");
const routes = require('./routes'); // Import the combined router from routes/index.js
const allowedOrigins = require('./config/allowedOrigin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or Postman)
		if (!origin) return callback(null, true);
		
		if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
	res.json({
		status: "healthy",
		service: "process-service",
		timestamp: new Date().toISOString(),
	});
});

// API info
app.get("/api", (req, res) => {
	res.json({
		service: "Booking Process Service",
		version: "1.0.0",
		endpoints: {
			bookings: "/api/bookings",
		},
	});
});

// Routes
app.use("/api", routes);

app.listen(PORT, () => {
	console.log(`Process Service running on port ${PORT}`);
	console.log(`API available at http://localhost:${PORT}/api`);
});
