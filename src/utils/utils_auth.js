import bcrypt from "bcrypt"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import env from "../configs/env.js"
import utils_db from "./utils_db.js"
import svc_db from "../services/svc_db.js"

export default {
    checkSignupForm(body) {
        if (!body || !body.username || !body.password || !body.cpassword) {
            return {'status': false, 'code': 0}
        } else if (typeof body.username != 'string' || typeof body.password != 'string' || typeof body.cpassword != 'string') {
            return {'status': false, 'code': 1}
        } else if (!(/^[A-Z_0-9.]{5,15}$/i.test(body.username))) {
            return {'status': false, 'code': 2}
        } else if (!(/^[A-Z_0-9.@#$%^&+=!-]{6,30}$/i.test(body.password))) {
            return {'status': false, 'code': 3}
        } else if (body.password != body.cpassword) {
            return {'status': false, 'code': 4}
        }
        return {'status': true}
    },
    checkLoginForm(body) {
        if (!body || !body.username || !body.password) {
            return {'status': false, 'code': 0}
        } else if (typeof body.username != 'string' || typeof body.password != 'string') {
            return {'status': false, 'code': 1}
        } else if (!(/^[A-Z_0-9.]{5,15}$/i.test(body.username))) {
            return {'status': false, 'code': 2}
        } else if (!(/^[A-Z_0-9.@#$%^&+=!-]{6,30}$/i.test(body.password))) {
            return {'status': false, 'code': 3}
        }
        return {'status': true}
    },

    /*
    Encryption
    */
    async encryptPassword(password) {
        return await bcrypt.hash(password, 12)
    },

    async verifyPassword(password, enc_password) {
        try {
            if (await bcrypt.compare(password, enc_password)) {
                return {"status": true, "valid": true}
            } else {
                return {"status": true, "valid": false}
            }
        } catch {
            return {"status": false}
        }
        
    },

    // Refresh Token
    generateRefreshToken(username, userid, expiration) {
        try {
            const iv = crypto.randomBytes(12)
            const key = Buffer.from(env.REFTKN_KEY, 'base64')
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
            cipher.setAAD(`userid:${userid};tkntype:refresh`)
            const plaintext = `${username}-${expiration}`
            const text_buffer = Buffer.from(String(plaintext), 'utf-8')
            const tkn = Buffer.concat([cipher.update(text_buffer), cipher.final()])
            const authTag = cipher.getAuthTag()
            return {'status': true, 'token':[iv.toString('base64url'), tkn.toString('base64url'), authTag.toString('base64url')].join('.')}
        } catch {
            return {'status': false}
        }
    },
    decipherRefreshToken(token, userid) {
        try {
            const [iv, tkn, authTag] = token.split('.')
            const key = Buffer.from(env.REFTKN_KEY, 'base64')
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'))
            decipher.setAAD(`userid:${userid};tkntype:refresh`)
            decipher.setAuthTag(Buffer.from(authTag, 'base64url'))
            const [username, expireTime] = Buffer.concat([decipher.update(Buffer.from(tkn, 'base64url')), decipher.final()]).toString('utf-8').split('-')
            return {"status":true, "username":username, "expiration": parseInt(expireTime)}
        } catch {
            return {'status': false}
        }
    },

    // Access Token
    createAccessToken(username, userid) {
        try {
            const token = jwt.sign({'uid':userid, 'uname':username}, env.JWT_KEY, {'issuer': 'JohnHarvard', 'expiresIn':900})
            return {'status': true, token}
        } catch {
            return {'status': false}
        }
    },

    // Middleware Auth
    async verifyRefreshToken(signedCookies) {
        const v1 = this.decipherRefreshToken(signedCookies.refreshToken, signedCookies.uid)
        if (!v1.status || v1.username != signedCookies.uname || v1.expiration < (new Date()).getTime()) {
            return {"auth": false};
        }

        const client = await svc_db.connect()
        if (!client) {
            return {"auth": false};
        }
        
        const v2 = await utils_db.verifyRefreshToken(signedCookies.refreshToken, parseInt(signedCookies.uid), client)
        if (!v2.status || !v2.valid) {
            client.release()
            return {"auth":false};
        }

        const v3 = await utils_db.checkUserExists(v1.username, client)
        if (!v3.status || !v3.exists || v3.user.id != parseInt(signedCookies.uid)) {
            client.release()
            return {"auth":false};
        }

        client.release()

        const a1 = this.createAccessToken(signedCookies.uname, parseInt(signedCookies.uid))
        if (!a1.status) {
            return {"auth":false};
        }

        return {"auth":true, "token":a1.token};
    }
}