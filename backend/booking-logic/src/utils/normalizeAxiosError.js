function normalizeAxiosError(err, source) {
    // Downstream service responded with HTTP error
    if (err.response) {
        return {
            status: err.response.status,
            body: err.response.data
        };
    }

    // Timeout
    if (err.code === "ECONNABORTED") {
        return {
            status: 504,
            body: {
                error: {
                    code: `${source}_TIMEOUT`,
                    message: "Downstream service timeout"
                }
            }
        };
    }

    // Network / crash
    return {
        status: 503,
        body: {
            error: {
                code: `${source}_UNAVAILABLE`,
                message: "Downstream service unavailable"
            }
        }
    };
}

module.exports = {
    normalizeAxiosError
};