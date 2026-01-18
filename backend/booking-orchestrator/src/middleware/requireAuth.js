const { verifyToken } = require("../auth/jwt");

function requireAuth(req, res, next) {
    const access = req.cookies.access_token;
    if (!access) return res.status(401).json({
        error: {
            code: "UNAUTHENTICATED",
            message: "Access Denied.",
        }
    });

    try {
        const payload = verifyToken(access);
        if (payload.type !== "access") return res.status(403).json({
            error: {
                code: "FORBIDDEN",
                message: "Access Denied.",
            }
        });

        req.user = { id: payload.sub, picture: payload.picture };
        next();
    } catch {
        return res.status(401).json({
            error: {
                code: "UNAUTHENTICATED",
                message: "Access Denied.",
            }
        });
    }
}

module.exports = { requireAuth };