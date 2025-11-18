import ctrl_auth from "../controllers/ctrl_auth.js";
import ctrl_quiz from "../controllers/ctrl_quiz.js";
import mdwr_auth from "../middlewares/mdwr_auth.js"
import mdwr_api from "../middlewares/mdwr_api.js";
import { Router } from "express";
const router = Router()

router.get('/', (req, res) => {
    res.render("index", {title:"Quiz Master"})
})

router.get('/home', mdwr_auth.verifyAuth, (val, req, res, next) => {
    if (!val.auth) {
        res.redirect(`/login?status=7`)
    } else {
        res.render('home', {title:"Quiz Master: Home", auth:val.authInfo, bicons:true})
    }
})

router.get('/quiz/create', mdwr_auth.verifyAuth, (val, req, res, next) => {
    if (!val.auth) {
        res.redirect(`/login?status=7`)
    } else {
        res.render('create_quiz', {title:"Quiz Master: Create Quiz", auth:val.authInfo, bicons:true})
    }
})
router.get('/quiz/create/success', (req, res) =>  {
    if (req.query.id) {
        res.render('create_quiz_success', {title:"Quiz Master: Quiz created", quizId:req.query.id})
    } else {
        res.redirect('/home')
    }
})

router.get('/quiz/:id', mdwr_auth.verifyAuth, mdwr_api.getQuizInfo, (val, req, res, next) => {
    if (!val.auth) {
        res.redirect(`/login?status=7`)
    } else if (!val.quiz_status) {
        next(500)
    } else if (!val.quiz_found) {
        next()
    } else {
        for (let question of val.quiz_info.questions) {
            question.answer = undefined
        }
        res.render('quiz', {title:"Quiz Master: Quiz", auth:val.authInfo, quiz_info:val.quiz_info})
    }
})

router.get('/api/quizzes', ctrl_quiz.getQuizList) // Get quizzes

router.post('/api/validate/quiz/:id', mdwr_auth.verifyAuth, ctrl_quiz.validateQuiz) // Validate quiz
router.post('/api/quiz', mdwr_auth.verifyAuth, ctrl_quiz.createQuiz) // Add quiz

router.delete('/api/quiz', mdwr_auth.verifyAuth, ctrl_quiz.deleteQuiz)

router.get('/login', (req, res) => {
    const loginMessages = ["A field is missing.", "Bad request: Reload the page and try again later.", "Username should have 5-15 characters (A-Z/a-z/0-9/_).", 
    "Password should have 4-30 characters (A-Z/a-z/0-9/_).", "User not found.", "Incorrect password.", "Account created, login to continue.", "Authentication failed, login to continue."]

    if (req.query.status && req.query.status in Object.keys(loginMessages)) {
        res.render("login", {title:"Quiz Master: Login", message:loginMessages[req.query.status]})
    } else if (req.query.status) {
        res.render("login", {title:"Quiz Master: Login", message:"Unexpected error (Status code not found)"})
    } else {
        res.render("login", {title:"Quiz Master: Login"})
    }
})

router.get('/signup', (req, res) => {
    const signupMessages = 
    ["A field is missing.", "Bad request: Reload the page and try again later.", "Username should have 5-15 characters (A-Z/a-z/0-9/_).", 
    "Password should have 4-30 characters (A-Z/a-z/0-9/_).", "Passwords's are different.", "User already exists."]

    if (req.query.status && signupMessages.length > req.query.status) {
        res.render("signup", {title:"Quiz Master: Signup", message:signupMessages[req.query.status]})
    } else if (req.query.status) {
        res.render("signup", {title:"Quiz Master: Signup", message:"Unexpected error (Status code not found)"})
    } else {
        res.render("signup", {title:"Quiz Master: Signup"})
    }
})

router.post('/signup', ctrl_auth.signup)
router.post('/login', ctrl_auth.login)


router.get('/profile/:id', mdwr_auth.verifyAuth, mdwr_api.getProfileInfo, (val, req, res, next) => {
    if (val.profileStatus == 404) next()
    else if (val.profileStatus == 500) next({'errorMessage': 'Error when loading profile'})
    else if (val.auth) {
        res.render('profile', {title:"Quiz Master: Profile", auth:{uid: req.signedCookies.uid, uname: req.cookies.uname}, bicons:true, profileInfo: {...val.profileInfo, yourId:req.signedCookies.uid}})
    } else {
        res.render('profile', {title:"Quiz Master: Profile", bicons:true, profileInfo: val.profileInfo})
    }
})

router.get('/500', (req, res, next) => {
    next({'errorMessage': '500 Page Example'})
})
router.get('/test', ctrl_auth.test)
router.get('/test/cookies', ctrl_auth.cookies)
router.get('/erase/cookies', ctrl_auth.eraseCookies)

// 404 Pages
router.use('/api/*route', (req, res) => {
    res.status(404).send({"info": "API endpoint not found"})
})
router.use('/*route', (req, res) => {
    res.render('not_found', {title:"Quiz Master: 404"})
})

// 500 Pages
router.use((val, req, res, next) => {
    if (val.errorMessage) {
        res.render('server_error', {title:"Quiz Master: 500", info:val.errorMessage})
    } else {
        res.render('server_error', {title:"Quiz Master: 500", info:"Unknown"})
    }
})

export default router