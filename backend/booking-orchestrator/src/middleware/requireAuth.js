const { verifyToken } = require("../auth/jwt");

function requireAuth(req, res, next) {
    const access = req.cookies.access_token;
    if (!access) return res.sendStatus(401);

    try {
        const payload = verifyToken(access);
        if (payload.type !== "access") return res.sendStatus(403);

        req.user = { id: payload.sub };
        next();
    } catch {
        return res.sendStatus(401);
    }
}

module.exports = { requireAuth };