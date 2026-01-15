require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
// const corsOptions = require('./config/corsOptions')
const routes = require('./routes'); // Import the combined router from routes/index.js
const { connectDB } = require('./config/dbConn')
const mongoose = require('mongoose');
const { error } = require('console');

const app = express();
const PORT = process.env.PORT || 3002;

// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());


// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'data-service' });
});

// Routes
app.use('/api/v1', routes);

app.get("/openapi.json", (req, res) => {
    const specPath = path.join(__dirname, "openapi.json");
    const spec = fs.readFileSync(specPath, "utf-8");
    res.type("application/json").send(spec);
});

// 404 handler
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('json')) {
        res.json({ error: { message: '404 Not Found' } })
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
connectDB();

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})