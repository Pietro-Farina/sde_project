const asyncHandler = require("express-async-handler");
const { createAccessToken, createRefreshToken, verifyToken, newJti } = require("../auth/jwt");
const { takePendingAssertion, allowRefresh, revokeRefresh, isRefreshAllowed, putPendingAssertion } = require("../auth/stores");
const { verifyAssertion } = require("../auth/assertion");

// 1) Login start: redirect user to adapter
const login = asyncHandler(async (req, res) => {
    const { provider } = req.params;
    if (provider !== "google") {
        return res.status(400).json({
            error: {
                code: "UNSUPPORTED_PROVIDER",
                message: "The selected provider is not supported."
            }
        });
    }
    // Browser starts at orchestrator, orchestrator sends to adapter
    const adapterBase = process.env.OAUTH_ADAPTER_SERVICE_URL;
    res.redirect(`${adapterBase}/api/oauth/${provider}/login`);
});

// 2) Finalize: browser arrives here after adapter redirects it
const completeLogin = asyncHandler(async (req, res) => {
    const { nonce } = req.query;
    if (!nonce || typeof nonce !== "string") return res.status(400).json({
        error: {
            code: "INVALID_NONCE",
            message: "Nonce is missing or invalid."
        }
    });

    const pending = takePendingAssertion(nonce);
    if (!pending) return res.status(400).json({
        error: {
            code: "NO_PENDING_LOGIN",
            message: "No pending login (expired or already used)."
        }
    });

    const { userId, frontendRedirectUrl } = pending;

    // Issue tokens
    const accessToken = createAccessToken(userId);
    const jti = newJti();
    const refreshToken = createRefreshToken(userId, jti);

    // allowlist refresh jti (demo-safe)
    const refreshTtl = Number(process.env.REFRESH_TTL_SECONDS || 604800);
    allowRefresh(jti, userId, refreshTtl);

    // Set cookies
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: Number(process.env.ACCESS_TTL_SECONDS || 900) * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/auth/refresh",
        maxAge: refreshTtl * 1000,
    });

    console.log("Response set-cookie headers:", res.getHeader("set-cookie"));

    res.redirect(frontendRedirectUrl || process.env.FRONTEND_DEFAULT_REDIRECT);
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refresh_token;
    if (!token) return res.sendStatus(401).json({
        error: {
            code: "NO_REFRESH_TOKEN",
            message: "No refresh token provided."
        }
    });

    try {
        const payload = verifyToken(token);
        if (payload.type !== "refresh") return res.status(403).json({
            error: {
                code: "INVALID_TOKEN_TYPE",
                message: "Provided token is not a refresh token."
            }
        });

        const allowedUser = isRefreshAllowed(payload.jti);
        if (!allowedUser || allowedUser !== payload.sub) return res.status(401).json({
            error: {
                code: "REFRESH_NOT_ALLOWED",
                message: "Refresh token is not allowed (revoked or unknown)."
            }
        });

        // Rotate refresh token: revoke old jti, issue new
        revokeRefresh(payload.jti);

        const newAccess = createAccessToken(payload.sub);

        const newRefreshJti = newJti();
        const newRefresh = createRefreshToken(payload.sub, newRefreshJti);

        const refreshTtl = Number(process.env.REFRESH_TTL_SECONDS || 604800);
        allowRefresh(newRefreshJti, payload.sub, refreshTtl);

        res.cookie("access_token", newAccess, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: Number(process.env.ACCESS_TTL_SECONDS || 900) * 1000,
        });

        res.cookie("refresh_token", newRefresh, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/auth/refresh",
            maxAge: refreshTtl * 1000,
        });

        return res.sendStatus(204);
    } catch {
        return res.status(401).json({
            error: {
                code: "INVALID_REFRESH_TOKEN",
                message: "Refresh token is invalid or expired."
            }
        });
    }
});

const logout = asyncHandler(async (req, res) => {
    const token = req.cookies.refresh_token;

    if (token) {
        try {
            const payload = verifyToken(token);
            if (payload?.jti) revokeRefresh(payload.jti);
        } catch {
            // ignore
        }
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token", { path: "/auth/refresh" });
    res.sendStatus(204);
});

const oauthAssert = asyncHandler(async (req, res) => {
    const { provider, sub, iat, nonce, signature, frontendRedirectUrl, picture } = req.body;

    if (!provider || !sub || !nonce || !signature) return res.status(400).json({
        error: {
            code: "MISSING_FIELDS",
            message: "One or more required fields are missing."
        }
    });

    const ok = verifyAssertion({
        provider,
        sub,
        iat: Number(iat),
        nonce,
        signature,
        picture,
    });

    if (!ok) return res.status(401).json({
        error: {
            code: "INVALID_ASSERTION",
            message: "Assertion verification failed."
        }
    });

    // FUTURE IMPLEMENTATION: link external account to internal user record
    // For demo, we just create a userId based on provider+sub
    const userId = `${provider}:${sub}`;

    // Store pending assertion for the browser finalization step
    // (TTL small to reduce replay window)
    putPendingAssertion(nonce, { userId, frontendRedirectUrl }, 60);

    return res.sendStatus(204);
});

module.exports = {
    login,
    completeLogin,
    refreshAccessToken,
    logout,
    oauthAssert,
};