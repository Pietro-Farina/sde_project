require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const passport = require("passport");
const allowedOrigins = require('./config/allowedOrigin');

require("./passport/google"); // registers strategy
// const corsOptions = require('./config/corsOptions')
const routes = require('./routes'); // Import the combined router from routes/index.js

const app = express();
app.use(passport.initialize());

const PORT = process.env.PORT || 3004;

// app.use(cors(corsOptions));
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'oauth-adapter' });
});

// Routes
app.use('/api/v1/oauth', routes);

app.get("/openapi.json", (req, res) => {
  const specPath = path.join(__dirname, "openapi.json");
  const spec = fs.readFileSync(specPath, "utf-8");
  res.type("application/json").send(spec);
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404)
  if (req.accepts('json')) {
    res.json({ message: '404 Not Found' })
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

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while processing the request."
    }
  });
});

app.listen(PORT, () => {
  console.log(`Paypal Adapter Service running on port ${PORT}`);
});
