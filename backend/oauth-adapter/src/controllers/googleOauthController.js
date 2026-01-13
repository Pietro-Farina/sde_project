const passport = require("passport");
const axios = require("axios");
const crypto = require("crypto");

const ORCHESTRATOR_INTERNAL_ASSERT_URL = process.env.ORCHESTRATOR_INTERNAL_ASSERT_URL;
const FRONTEND_REDIRECT_URL = process.env.FRONTEND_REDIRECT_URL;
const ORCHESTRATOR_COMPLETE_URL = process.env.ORCHESTRATOR_COMPLETE_URL;

function signAssertion({ provider, sub, iat, nonce, picture }) {
    const secret = process.env.INTERNAL_ASSERTION_SECRET;
    const msg = `${provider}|${sub}|${iat}|${nonce}|${picture || ''}`;
    return crypto.createHmac("sha256", secret).update(msg).digest("base64");
}

const startGoogleLogin = passport.authenticate("google", {
    session: false,
    scope: ["openid", "profile", "email"],
});

const googleCallback = [
    passport.authenticate("google", { session: false, failureRedirect: "/oauth/failure" }),

    async (req, res) => {
        // req.user comes from passport verify callback
        const { provider, sub, picture } = req.user;

        // Create signed assertion for orchestrator
        const iat = Math.floor(Date.now() / 1000);
        const nonce = crypto.randomUUID();
        const signature = signAssertion({ provider, sub, iat, nonce, picture });

        try {
            await axios.post(ORCHESTRATOR_INTERNAL_ASSERT_URL, {
                provider,
                sub,
                iat,
                nonce,
                signature,
                picture,
                // where orchestrator should finally redirect the browser
                frontendRedirectUrl: FRONTEND_REDIRECT_URL,
            });
        } catch (error) {
            console.error("Error notifying orchestrator:", error);
            return res.sendStatus(500);
        }

        // After notifying orchestrator, redirect the *browser* to orchestrator finalize endpoint
        // Orchestrator will already be ready to set cookies & redirect to frontend.
        res.redirect(`${ORCHESTRATOR_COMPLETE_URL}?nonce=${encodeURIComponent(nonce)}`);
    },
];

module.exports = { startGoogleLogin, googleCallback };