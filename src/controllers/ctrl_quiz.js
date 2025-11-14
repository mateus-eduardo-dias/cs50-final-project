import utils_db from "../utils/utils_db.js"

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
        } else if (req.body == undefined) {
            res.status(400).end()
            return;
        } else if (!req.body.answers) {
            res.status(400).end()
            return;
        }

        const quizRequest = await utils_db.getQuizInfo(req.params.id)
        if (!quizRequest.status) {
            res.status(500).end()
            return;
        } else if (quizRequest.info.rowCount == 0) {
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

        // TODO: Save history
        const a1 = await utils_db.saveUserHistory(req.signedCookies.uid, req.params.id)

        res.send({'questions': parseInt(i) + 1, 'correct': n_correct, 'wrong': n_wrong, 'info': n_wrong > 0 ? wrong_answers : undefined})
        return;
    },
    async createQuiz(val, req, res, next) {
        if (!val.auth) {
            res.status(401).end()
            return;
        } else if (!req.body || !req.body.title || !req.body.questions || typeof req.body.title != 'string' || typeof req.body.questions != 'object') {
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
    }
}