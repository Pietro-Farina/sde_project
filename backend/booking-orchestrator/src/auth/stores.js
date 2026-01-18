const pendingAssertions = new Map(); // nonce -> { userId, picture, frontendRedirectUrl, expiresAt }
const refreshAllowlist = new Map();  // jti -> { userId, expiresAt }

function now() {
    return Date.now();
}

function putPendingAssertion(nonce, value, ttlSeconds = 60) {
    pendingAssertions.set(nonce, { ...value, expiresAt: now() + ttlSeconds * 1000 });
}

function takePendingAssertion(nonce) {
    const item = pendingAssertions.get(nonce);
    pendingAssertions.delete(nonce);
    if (!item) return null;
    if (item.expiresAt < now()) return null;
    return item;
}

function allowRefresh(jti, userId, ttlSeconds) {
    refreshAllowlist.set(jti, { userId, expiresAt: now() + ttlSeconds * 1000 });
}

function revokeRefresh(jti) {
    refreshAllowlist.delete(jti);
}

function isRefreshAllowed(jti) {
    const item = refreshAllowlist.get(jti);
    if (!item) return null;
    if (item.expiresAt < now()) {
        refreshAllowlist.delete(jti);
        return null;
    }
    return item.userId;
}

module.exports = {
    putPendingAssertion,
    takePendingAssertion,
    allowRefresh,
    revokeRefresh,
    isRefreshAllowed,
};