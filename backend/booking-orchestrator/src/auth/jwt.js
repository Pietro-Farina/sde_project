const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;

function createAccessToken(userId, picture) {
    const ttl = Number(process.env.ACCESS_TTL_SECONDS || 900);
    return jwt.sign(
        { sub: userId, type: "access", picture },
        JWT_SECRET,
        { expiresIn: ttl }
    );
}

function createRefreshToken(userId, jti, picture) {
    const ttl = Number(process.env.REFRESH_TTL_SECONDS || 604800);
    return jwt.sign(
        { sub: userId, type: "refresh", jti, picture },
        JWT_SECRET,
        { expiresIn: ttl }
    );
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

function newJti() {
    return crypto.randomUUID();
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    verifyToken,
    newJti,
};