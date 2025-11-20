import utils_db from "../utils/utils_db.js"
import svc_db from "../services/svc_db.js"
import utils_auth from "../utils/utils_auth.js"

export default {
    async getQuizList(req, res) {
        const quizRequest = await utils_db.getAllQuizzes()
        if (!quizRequest.status) {
            res.status(500).end()
            return;
        } else {
            res.status(200).send({'size':quizRequest.rowCount, 'list': quizRequest.rows})
            return;
        }
    },
    async validateQuiz(val, req, res, next) {
        if (!val.auth) {
            res.status(401).end()
            return;
        } else if (!req.body) {
            res.status(400).end()
            return;
        } else if (!req.body.answers) {
            res.status(400).end()
            return;
        }

        const client = await svc_db.connect()
        if (!client) {
            res.status(500).end()
            return;
        }

        const quizRequest = await utils_db.getQuizInfo(req.params.id, client)
        if (!quizRequest.status) {
            client.release()
            res.status(500).end()
            return;
        } else if (quizRequest.info.rowCount == 0) {
            client.release()
            res.status(404).send({'found':false})
            return;
        }

        let n_correct = 0
        let n_wrong = 0
        let wrong_answers = []
        let i = 0
        for (i in quizRequest.info.rows[0].questions) {
            const question = quizRequest.info.rows[0].questions[i]
            if (question.answer == req.body.answers[i]) {
                n_correct += 1;
            } else {
                n_wrong += 1;
                wrong_answers.push({'question_id': parseInt(i), 'answer_id': question.options.indexOf(question.answer)})
            }
        }

        const a1 = await utils_db.saveUserHistory(req.signedCookies.uid, req.params.id, client)
        client.release()

        res.send({'questions': parseInt(i) + 1, 'correct': n_correct, 'wrong': n_wrong, 'info': n_wrong > 0 ? wrong_answers : undefined, 'saved':a1.status})
        return;
    },
    async createQuiz(val, req, res, next) {
        if (!val.auth) {
            res.status(401).end()
            return;
        } else if (!req.body || !req.body.title || !req.body.questions || req.body.questions.length == 0 || typeof req.body.title != 'string' || typeof req.body.questions != 'object') {
            res.status(400).end()
            return;
        }

        for (let questionInfo of req.body.questions) {
            const answerId = questionInfo.answer
            if (isNaN(answerId) || typeof answerId != 'number' || answerId < 0 || answerId > 3) {
                res.status(400).end()
                return;
            }
            
            const options = questionInfo.options
            if (typeof options[0] != 'string' || typeof options[1] != 'string' || typeof options[2] != 'string' || typeof options[3] != 'string') {
                res.status(400).end()
                return;
            } else if (!pattern.test(options[0]) || !pattern.test(options[1]) || !pattern.test(options[2]) || !pattern.test(options[3])) {
                res.status(400).end()
                return;
            }
            const question = questionInfo.question
            if (!pattern.test(question) || typeof question != 'string') {
                res.status(400).end()
                return;
            }

            questionInfo.answer = questionInfo.options[answerId]
        }

        const a1 = await utils_db.createQuiz(req.body.title, req.signedCookies.uid, req.body.questions)
        if (!a1.status) {
            res.status(500).end()
            return;
        } else if (a1.info.rowCount == 0) {
            res.status(204).end()
            return;
        }

        res.status(201).send({'id': parseInt(a1.info.rows[0].id)})
        return;
    },
    async deleteQuiz(val, req, res, next) {
        if (!req.body || !req.body.id || !req.body.password || typeof req.body.password != 'string' || !(/^[A-Z_0-9.@#$%^&+=!-]{4,30}$/i.test(req.body.password))) {
            res.status(400).end()
            return;
        }

        const client = await svc_db.connect()
        if (!client) {
            res.status(500).end()
        }

        const v1 = await utils_db.checkUserExists(req.signedCookies.uname, client)

        if (!v1.status) {
            client.release()
            res.status(500).end()
            return;
        } else if (!v1.exists) {
            client.release()
            res.cookie('refreshToken', '', {'signed':true, 'sameSite':true, 'httpOnly':true, 'maxAge':0})
            res.cookie('accessToken', '', {'signed':true, 'sameSite':true, 'httpOnly':true, 'maxAge':0})
            res.cookie('uid', '', {'signed':true, 'sameSite':true, 'httpOnly':true, 'maxAge': 0})
            res.cookie('uname', '', {'signed':true, 'sameSite': true, 'httpOnly':true, 'maxAge': 0})
            res.status(401).end()
            return;
        } else if (v1.user.id != parseInt(req.signedCookies.uid)) {
            client.release()
            res.status(403).end()
            return;
        }

        const v2 = await utils_auth.verifyPassword(req.body.password, v1.user.password)
        if (!v2.status) {
            client.release()
            res.status(500).end()
            return;
        } else if (!v2.valid) {
            client.release()
            res.status(403).end()
            return;
        }

        const v3 = await utils_db.deleteQuiz(req.body.id, req.signedCookies.uid, client)
        if (!v3.status) {
            client.release()
            res.status(500).end()
            return;
        } else if (v3.rowCount == 0) {
            client.release()
            res.status(404).end()
            return;
        }

        res.send({'deleted': req.body.id, 'name': v3.rows[0].title})
        return;
    }
}