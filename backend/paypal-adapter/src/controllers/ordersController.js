const { Client, Environment, OrdersController, PaymentsController } = require("@paypal/paypal-server-sdk");
const asyncHandler = require("express-async-handler");

const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID,
        oAuthClientSecret: process.env.PAYPAL_SECRET,
    },
    environment: Environment.Sandbox,
});

const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);

const createOrder = asyncHandler(async (req, res) => {
    const { reservationId, priceToPay } = req.body;

    if (!reservationId || !priceToPay) {
        return res.status(400).json({ message: "Missing required data" });
    }

    const orderRequest = {
            body: {
                intent: "CAPTURE",
                purchaseUnits: [{
                    customId: reservationId, // pass reservation ID for later reference
                    amount: {
                        currencyCode: "EUR",
                        value: priceToPay.toString() // must be string with 2 decimals
                    }
                }]
            },
            perfer: "return=minimal"
        };

    try {
        // Start payment process via payment service
        const response = await ordersController.createOrder(orderRequest);

        const orderID = response.result.id;

        return res.status(201).json({
            data: {
                orderID
            },
        })
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

const captureOrder = asyncHandler(async (req, res) => {
    const { orderID } = req.body;

    if (!orderID) {
        return res.status(400).json({ message: "Missing required data" });
    }

    const collect = {
        id: orderID,
        prefer: "return=minimal"
    }

    try {
        const response = await ordersController.captureOrder(collect);

        const status = response.result.status;
        const captureId = response.result.purchaseUnits[0].payments.captures[0].id;

        console.log("Status:", status, "Capture ID:", captureId);

        return res.status(200).json({
            data: {
                status,
                captureId
            }
        });
    } catch (error) {
        console.error("Error capturing order:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

const refundOrder = asyncHandler(async (req, res) => {
    const { captureId, reservationId } = req.body;

    if (!captureId || !reservationId) {
        return res.status(400).json({ message: "Missing required data" });
    }

    const refundRequest = {
        captureId: captureId,
        paypalRequestId: reservationId,
        prefer: 'return=minimal',
        body: {}
    };

    try {
        const response = await paymentsController.refundCapturedPayment(refundRequest);

        const refundId = response.result.id;
        const status = response.result.status;

        return res.status(200).json({
            data: {
                refundId,
                status
            }
        });
    } catch (error) {
        console.error("Error refunding payment:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = {
    createOrder,
    captureOrder,
    refundOrder
};