import jwt from "jsonwebtoken"
import env from "../configs/env.js"
import utils_auth from "../utils/utils_auth.js"

export default {
    async verifyAuth(req, res, next) {
        if (!req.signedCookies.uid || !req.signedCookies.uname) {
            next({"auth": false})
        } else if (req.signedCookies.accessToken) {
            try {
                const token = jwt.verify(req.signedCookies.accessToken, env.JWT_KEY, {'issuer':'JohnHarvard'})
                if (typeof token.uid != 'number' || typeof token.uname != 'string' || token.uid != parseInt(req.signedCookies.uid) || token.uname != req.signedCookies.uname) {
                    const a1 = await utils_auth.verifyRefreshToken(req.signedCookies)
                    if (a1.auth) {
                        res.cookie('accessToken', a1.token, {'signed':true, 'sameSite':true, 'httpOnly':true, 'maxAge':900000}) // 15 mins
                        next({"auth":true, "authInfo":{uname: req.signedCookies.uname, uid: req.signedCookies.uid}})
                        return;
                    }

                    next({"auth":false})
                    return;
                }

                next({"auth":true, "authInfo":{uname: req.signedCookies.uname, uid: req.signedCookies.uid}})
            } catch {
                next({"auth":false})
                return;
            }
        } else if (req.signedCookies.refreshToken) {
            const a1 = await utils_auth.verifyRefreshToken(req.signedCookies)
            if (a1.auth) {
                res.cookie('accessToken', a1.token, {'signed':true, 'sameSite':true, 'httpOnly':true, 'maxAge':900000}) // 15 mins
                next({"auth":true, "authInfo":{uname: req.signedCookies.uname, uid: req.signedCookies.uid}})
                return;
            }

            next({"auth":false})
            return;
        } else {
            next({"auth": false})
        }
    }
}