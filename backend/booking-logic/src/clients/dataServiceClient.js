const axios = require('axios');

const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL || 'http://localhost:3002';

class DataServiceClient {
    async getAllBookings() {
        try {
          const response = await axios.get(`${DATA_SERVICE_URL}/api/data/bookings`);
          return response.data;
        } catch (error) {
          throw new Error(`Data service error: ${error.message}`);
        }
      }
}

module.exports = new DataServiceClient();