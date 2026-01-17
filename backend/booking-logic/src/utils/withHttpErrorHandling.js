function withHttpErrorHandling(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (err) {
            // normalized axios / client error
            if (err?.status && err?.body) {
                return res.status(err.status).json(err.body);
            }

            // unexpected bug
            console.error(err);
            return res.status(500).json({
                error: {
                    code: "INTERNAL_ERROR",
                    message: "Unexpected server error"
                }
            });
        }
    };
}

module.exports = { withHttpErrorHandling };