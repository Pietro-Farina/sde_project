function sendError(res, status, code, message, details) {
    return res.status(status).json({
        error: {
            code,
            message
        },
    });
}

// true if the error looks like your normalized downstream error: { status, body: { error: { code, message } } }
function isNormalizedDownstreamError(err) {
    return (
        err &&
        typeof err.status === "number" &&
        err.body &&
        typeof err.body === "object" &&
        err.body.error &&
        typeof err.body.error === "object"
    );
}

// Generic dependency translation (when you don't want to leak internal codes)
/**
 * Generic dependency error translator. From a normalized downstream error or unknown error,
 * generates and sends an appropriate 5xx response.
 * Possible responses:
 * - 502 DEPENDENCY_ERROR
 * - 503 DEPENDENCY_UNAVAILABLE
 * - 504 DEPENDENCY_TIMEOUT
 * @param {*} res 
 * @param {*} err 
 * @param {*} fallbackCode 
 * @returns 
 */
function translateDependencyError(res, err, fallbackCode) {
    // If already normalized but not meant to be propagated, map to 502/503
    // Treat 5xx from downstream as dependency problem
    if (isNormalizedDownstreamError(err)) {
        const status = err.status;
        if (status === 504) return sendError(res, 504, "DEPENDENCY_TIMEOUT", "A dependent service timed out.");
        if (status === 503) return sendError(res, 503, "DEPENDENCY_UNAVAILABLE", "A dependent service is unavailable.");
        if (status >= 500) return sendError(res, 502, "DEPENDENCY_ERROR", "A dependent service failed.");
        // downstream 4xx but we chose not to propagate (e.g., adapter details)
        return sendError(res, 502, fallbackCode, "External provider rejected the request.");
    }

    // Unknown/buggy error shape
    console.error("Unexpected error shape:", err);
    return sendError(res, 502, "DEPENDENCY_ERROR", "A dependent service failed.");
}

module.exports = {
    sendError,
    isNormalizedDownstreamError,
    translateDependencyError,
};