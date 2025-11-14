import utils_db from "../utils/utils_db.js";

export default {
    async getQuizInfo(val, req, res, next) {
        if (isNaN(req.params.id) || typeof req.params.id != "string") {
            next({...val, 'quiz_status':false})
            return;
        }
        const quizRequest = await utils_db.getQuizInfo(req.params.id)
        if (!quizRequest.status) {
            next({...val, 'quiz_status':false})
        } else if (quizRequest.info.rowCount == 0) {
            next({...val, 'quiz_status':true, 'quiz_found':false})
        } else {
            next({...val, 'quiz_status':true, 'quiz_found':true, 'quiz_info': quizRequest.info.rows[0]})
        }
    },
    async getProfileInfo(val, req, res, next) {
        if (isNaN(req.params.id) || typeof req.params.id != "string") {
            next({...val, 'profileStatus':500})
            return;
        }
        const a1 = await utils_db.getUserInfo(req.params.id)
        if (!a1.status) {
            next({...val, 'profileStatus':500})
            return;
        } else if (a1.info.rowCount == 0) {
            next({...val, 'profileStatus':404})
            return;
        }

        next({...val, 'profileStatus':200, 'profileInfo': a1.info.rows[0]})
    }
}