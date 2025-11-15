import utils_auth from "../utils/utils_auth.js"
import utils_db from "../utils/utils_db.js"
import svc_db from "../services/svc_db.js"

export default {
    async signup(req, res, next) {
        const v1 = utils_auth.checkSignupForm(req.body)
        if (!v1.status) {
            res.redirect(`/signup?status=${v1.code}`)
            return;
        }

        const client = await svc_db.connect()
        if (!client) {
            next('500')
        }
        await svc_db.begin(client)

        const v2 = await utils_db.checkUserExists(req.body.username, client, true)
        if (!v2.status) {
            await svc_db.rollback(client)
            client.release()
            res.redirect("/signup?status=1")
            return;
        } else if (v2.exists) {
            await svc_db.rollback(client)
            client.release()
            res.redirect("/signup?status=5")
            return;
        }

        const a1 = await utils_db.createUser(req.body.username, req.body.password, client)
        if (!a1.status) {
            await svc_db.rollback(client)
            client.release()
            res.redirect("/signup?status=1")
            return;
        }

        svc_db.setSavepoint(client, 'user_created')

        const expiration = new Date(Date.now() + 2592000000) // 1 month

        const a2 = await utils_db.createRefreshToken(a1.created.username, a1.created.id, expiration.getTime(), client)
        if (!a2.status) {
            await svc_db.rollbackToSavepoint(client, 'user_created')
            await svc_db.commit(client)
            client.release()
            res.redirect("/login?status=6")
            return;
        }

        const a3 = utils_auth.createAccessToken(a1.created.username, a1.created.id)
        if (!a3.status) {
            await svc_db.rollbackToSavepoint(client, 'user_created')
            await svc_db.commit(client)
            client.release()
            res.redirect("/login?status=6")
            return;
        }

        await svc_db.commit(client)
        client.release()

        res.cookie('refreshToken', a2.token, {'signed':true, 'sameSite':true, 'httpOnly':true, 'expires': expiration}) // 30 days
        res.cookie('accessToken', a3.token, {'signed':true, 'sameSite':true, 'httpOnly':true, 'maxAge':900000}) // 15 mins
        res.cookie('uid', a1.created.id, {'signed':true, 'sameSite':true, 'httpOnly':true, 'expires': expiration})
        res.cookie('uname', a1.created.username, {'signed':true, 'sameSite': true, 'httpOnly':true, 'expires': expiration})

        res.redirect('/home')
        return;
    },
    async login(req, res) {
        const v1 = utils_auth.checkLoginForm(req.body)
        if (!v1.status) {
            res.redirect(`/login?status=${v1.code}`)
            return;
        }

        const client = await svc_db.connect()
        if (!client) {
            next('500')
        }
        await svc_db.begin(client)

        const v2 = await utils_db.checkUserExists(req.body.username, client, false)
        if (!v2.status) {
            await svc_db.rollback(client)
            client.release()
            res.redirect("/login?status=1")
            return;
        } else if (!v2.exists) {
            await svc_db.rollback(client)
            client.release()
            res.redirect("/login?status=4")
            return;
        }

        const v3 = await utils_auth.verifyPassword(req.body.password, v2.user.password)
        if (!v3.status) {
            await svc_db.rollback(client)
            client.release()
            res.redirect("/login?status=1")
            return;
        } else if (!v3.valid) {
            await svc_db.rollback(client)
            client.release()
            res.redirect("/login?status=5")
            return;
        }

        const expiration = new Date(Date.now() + 2592000000)

        const a1 = await utils_db.createRefreshToken(v2.user.username, v2.user.id, expiration.getTime(), client)
        if (!a1.status) {
            await svc_db.rollback(client)
            client.release()
            res.redirect("/signup?status=4")
            return;
        }

        const a2 = utils_auth.createAccessToken(v2.user.username, v2.user.id)
        if (!a2.status) {
            await svc_db.rollback(client)
            client.release()
            res.redirect("/signup?status=4")
            return;
        }

        await svc_db.commit(client)
        client.release()

        res.cookie('refreshToken', a1.token, {'signed':true, 'sameSite':true, 'httpOnly':true, 'expires': expiration}) // 30 days
        res.cookie('accessToken', a2.token, {'signed':true, 'sameSite':true, 'httpOnly':true, 'maxAge':900000}) // 15 mins
        res.cookie('uid', v2.user.id, {'signed':true, 'sameSite':true, 'httpOnly':true, 'expires': expiration})
        res.cookie('uname', v2.user.username, {'signed':true, 'sameSite': true, 'httpOnly':true, 'expires': expiration})

        res.redirect('/home')
        return;
    },

    test(req, res) {
        res.status(200).end()
    },
    cookies(req, res) {
        res.send({
            'cookies': req.cookies,
            'signedCookies': req.signedCookies
        })
    },
    eraseCookies(req, res) {
        res.cookie('refreshToken', '', {'signed':true, 'sameSite':true, 'httpOnly':true, 'maxAge':0}) // 30 days
        res.cookie('accessToken', '', {'signed':true, 'sameSite':true, 'httpOnly':true, 'maxAge':0}) // 15 mins
        res.cookie('uid', '', {'signed':true, 'sameSite':true, 'httpOnly':true, 'maxAge': 0})
        res.cookie('uname', '', {'signed':true, 'sameSite': true, 'httpOnly':true, 'maxAge': 0})
        res.send("Data erased: No cookies")
    }
}