// cleanupCron.js
const axios = require('axios');
const cron = require('node-cron');

const API_URL = process.env.CLEANUP_API_URL || 'http://booking-data:3000/api/v1/v1/reservations/cleanup'; // Adjust port/path as needed
const API_KEY = process.env.CLEANUP_API_KEY || '';

cron.schedule('*/10 * * * *', async () => { // Every 10 minutes
    try {
        await axios.patch(API_URL, {}, {
            headers: API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}
        });
        console.log(`[${new Date().toISOString()}] Cleanup triggered`);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Cleanup failed:`, err.message);
    }
});

console.log('Cleanup cron job started.');
