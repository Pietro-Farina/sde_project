const crypto = require("crypto");

function expectedSignature({ provider, sub, iat, nonce, picture }) {
    const secret = process.env.INTERNAL_ASSERTION_SECRET;
    const msg = `${provider}|${sub}|${iat}|${nonce}|${picture || ''}`;
    return crypto.createHmac("sha256", secret).update(msg).digest("base64");
}

function safeEqual(a, b) {
    const ab = Buffer.from(a || "", "utf8");
    const bb = Buffer.from(b || "", "utf8");
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
}

function verifyAssertion({ provider, sub, iat, nonce, signature, picture }) {
    // basic freshness check (avoid replay)
    const now = Math.floor(Date.now() / 1000);
    if (typeof iat !== "number" || Math.abs(now - iat) > 120) return false;

    const expSig = expectedSignature({ provider, sub, iat, nonce, picture });
    return safeEqual(signature, expSig);
}

module.exports = { verifyAssertion };