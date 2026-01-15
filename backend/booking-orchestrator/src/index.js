const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require('./routes'); // Import the combined router from routes/index.js
const allowedOrigins = require('./config/allowedOrigin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use((req, res, next) => {
  const dateTime = new Date().toISOString();
  const logItem = `${dateTime}\t${req.method}\t${req.url}\t${req.headers.origin}\n`
  if (!req.url.includes('/health'))
    console.log(logItem);
  next();
});
const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or Postman)
		if (!origin) return callback(null, true);
		
		if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
			callback(null, true);
		} else {
			callback(null, true);
			//callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

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

app.get("/openapi.json", (req, res) => {
	const specPath = path.join(__dirname, "openapi.json");
	const spec = fs.readFileSync(specPath, "utf-8");
  res.type("application/json").send(spec);
});

app.get("/__test/set-cookie", (req, res) => {
  res.cookie("test_cookie", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // FONDAMENTALE
  });

  res.send("cookie set");
});
app.get("/__test/check-cookie", (req, res) => {
  res.json({
    cookiesHeader: req.headers.cookie || null,
  });
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
	console.log(`Process Service running on port ${PORT}`);
	console.log(`API available at http://localhost:${PORT}/api`);
});
