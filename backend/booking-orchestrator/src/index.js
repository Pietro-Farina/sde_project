const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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
app.use("/api", bookingRoutes);

app.listen(PORT, () => {
	console.log(`Process Service running on port ${PORT}`);
	console.log(`API available at http://localhost:${PORT}/api`);
});
