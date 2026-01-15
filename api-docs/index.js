const express = require('express');
const swaggerUi = require('swagger-ui-express');

const app = express();

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        name: "Booking Orchestrator",
        url: "http://localhost:3000/openapi.json",
      },
      {
        name: "Booking Logic",
        url: "http://localhost:3001/openapi.json",
      },
      {
        name: "Booking Data Service",
        url: "http://localhost:3002/openapi.json",
      },
      {
        name: "PayPal Adapter",
        url: "http://localhost:3003/openapi.json",
      },
      {
        name: "OAuth Adapter",
        url: "http://localhost:3004/openapi.json",
      },
    ],
  },
};

app.use("/", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

app.listen(4000, () => {
  console.log("API Docs running on port 4000");
});
