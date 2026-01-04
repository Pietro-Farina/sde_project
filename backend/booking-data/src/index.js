require('dotenv').config();

const express = require('express');
const cors = require('cors');
// const corsOptions = require('./config/corsOptions')
const routes = require('./routes'); // Import the combined router from routes/index.js
const { connectDB } = require('./config/dbConn')
const mongoose = require('mongoose')

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
app.use('/api/data', routes);

// 404 handler
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('json')) {
        res.json({ message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

connectDB();

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`) )
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})