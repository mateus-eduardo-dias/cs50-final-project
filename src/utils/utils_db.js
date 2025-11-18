import svc_db from "../services/svc_db.js"
import utils_auth from "./utils_auth.js"

export default {
    // USER
    async checkUserExists(username, client=undefined, lockRow=false) {
        const main_client = client == undefined ? await svc_db.connect() : client;
        if (!main_client) {
            return {'status':false}
        }
        const v1 = await svc_db.getUserByUsername(username, main_client, lockRow)
        if (!client) main_client.release();
        
        if (!v1.status) {
            return {'status':false}
        }

        if (v1.rowCount == 1) {
            v1.rows[0].id = parseInt(v1.rows[0].id)
            return {'status':true, 'exists':true, 'user': v1.rows[0]}
        } else {
            return {'status':true, 'exists':false}
        }
    },
    async createUser(username, password, client) {
        const main_client = client == undefined ? await svc_db.connect() : client;
        if (!main_client) {
            return {'status':false}
        }
        const enc_password = await utils_auth.encryptPassword(password)

        const a1 = await svc_db.createUser(username, enc_password, main_client)
        if (!client) main_client.release();
        if (!a1.status) {
            return {'status':false}
        } else {
            return {'status': true, "created":a1.created}
        }
    },

    async createRefreshToken(username, userid, expiration, client) {
        const a1 = utils_auth.generateRefreshToken(username, userid, expiration)
        if (!a1.status) {
            return {'status': false}
        }
        const main_client = client == undefined ? await svc_db.connect() : client;
        if (!main_client) {
            return {'status':false}
        }
        const a2 = await svc_db.saveRefreshToken(a1.token, userid, expiration / 1000, main_client)
        if (!client) main_client.release();
        if (!a2.status) {
            return {'status':false}
        }
        
        return {'status': true, 'token': a1.token}
    },

    async verifyRefreshToken(token, userid, client) {
        const main_client = client == undefined ? await svc_db.connect() : client;
        if (!main_client) {
            return {'status':false}
        }
        const a1 = await svc_db.searchRefreshToken(token, userid, main_client)
        if (client == undefined) main_client.release();
        if (!a1.status) {
            return {'status': false}
        } else if (a1.rowCount == 0) {
            return {'status': true, 'valid': false}
        }
        return {'status': true, 'valid': true}
    },

    async getUserInfo(userid, client=undefined) {
        const main_client = client == undefined ? await svc_db.connect() : client;
        if (!main_client) {
            return {'status':false}
        }
        const a1 = await svc_db.getUserInfo(userid, main_client)
        if (client == undefined) main_client.release();
        if (!a1.status) {
            return {'status':false}
        }

        return {'status': true, 'info': {'rowCount': a1.rowCount, 'rows': a1.rows}}
    },

    // Quizzes
    async getAllQuizzes(client=undefined) {
        const main_client = client == undefined ? await svc_db.connect() : client;
        if (!main_client) {
            return {'status':false}
        }
        const a1 = await svc_db.getAllQuizzes(main_client)
        if (client == undefined) main_client.release();
        if (!a1.status) {
            return {'status':false}
        }

        return {'status': true, 'rowCount': a1.rowCount, 'rows': a1.rows}
    },
    async getQuizInfo(quizid, client=undefined) {
        const main_client = client == undefined ? await svc_db.connect() : client;
        if (!main_client) {
            return {'status':false}
        }
        const a1 = await svc_db.getQuizInfo(quizid, main_client)
        if (!client) main_client.release();
        if (!a1.status) {
            return {'status':false}
        }

        return {'status': true, 'info': {'rowCount': a1.rowCount, 'rows': a1.rows}}
    },
    async saveUserHistory(userid, quizid, client=undefined) {
        const main_client = client == undefined ? await svc_db.connect() : client;
        if (!main_client) {
            return {'status':false}
        }
        const a1 = await svc_db.saveUserHistory(userid, quizid, main_client)
        if (client == undefined) main_client.release();
        if (!a1.status) {
            return {'status':false}
        }

        return {'status': true}
    },
    async createQuiz(title, userid, questions, client=undefined) {
        const main_client = client == undefined ? await svc_db.connect() : client;
        if (!main_client) {
            return {'status':false}
        }
        const a1 = await svc_db.createQuiz(title, userid, questions, main_client)
        if (client == undefined) main_client.release();
        if (!a1.status) {
            return {'status':false}
        }

        return {'status': true, 'rowCount': a1.rowCount, 'rows': a1.rows}
    },
    async deleteQuiz(question_id, user_id, client=undefined) {
        const main_client = client == undefined ? await svc_db.connect() : client;
        if (!main_client) {
            return {'status':false}
        }
        const a1 = await svc_db.deleteQuiz(question_id, user_id, main_client)
        if (client == undefined) main_client.release();
        if (!a1.status) {
            return {'status':false}
        }

        return {'status': true, 'rowCount': a1.rowCount, 'rows': a1.rows}
    }
}