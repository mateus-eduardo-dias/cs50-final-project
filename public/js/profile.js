const userQuizzesRow = document.getElementById("user-quizzes-row")
const userHistoryRow = document.getElementById("user-history-row")
const loadUserQuizzesBtn = document.getElementById("loadUserQuizzesBtn")
const loadUserHistoryBtn = document.getElementById("loadUserHistoryBtn")

const n_user_quizzes = userInfo.user_quizzes.length
let n_loaded_user_quizzes = 0

const n_user_history = userInfo.quiz_history.length
let n_loaded_user_history = 0

if (n_user_quizzes == 0) {
    const e = document.createElement('div')
    e.classList.add('text-center', 'fs-6')
    e.textContent = "User has not made any quiz"
    userQuizzesRow.classList.remove('row', 'row-cols-auto')
    userQuizzesRow.appendChild(e)
}

if (n_user_history == 0) {
    const e = document.createElement('div')
    e.classList.add('text-center', 'fs-6')
    e.textContent = "User has not played any quiz"
    userHistoryRow.classList.remove('row', 'row-cols-auto')
    userHistoryRow.appendChild(e)
}

userInfo.quiz_history.sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity))

function loadUserQuizzes() {
    for (let i = 0; i < 5; i++) {
        if (n_user_quizzes > n_loaded_user_quizzes) {
            const quiz = userInfo.user_quizzes[n_loaded_user_quizzes]
            const e = document.createElement('quiz-element')
            const e2 = document.createElement('div')
            e.setAttribute('name', quiz.title)
            e.setAttribute('author', userInfo.username)
            e.setAttribute('views', quiz.views)
            e.setAttribute('quiz-id', quiz.id)
            e.setAttribute('balanced', 'true')
            e2.classList.add('col', 'px-0')
            e2.appendChild(e)
            userQuizzesRow.appendChild(e2)
            n_loaded_user_quizzes ++;
        } else {
            loadUserQuizzesBtn.classList.add('d-none')
        }
    }
    if (n_user_quizzes == n_loaded_user_quizzes) {
        loadUserQuizzesBtn.classList.add('d-none')
    }
}

function loadUserHistory() {
    for (let i = 0; i < 5; i++) {
        if (n_user_history > n_loaded_user_history) {
            const quiz = userInfo.quiz_history[n_loaded_user_history]
            const e = document.createElement('quiz-element')
            const e2 =  document.createElement('div')
            e.setAttribute('name', quiz.title)
            e.setAttribute('author', quiz.username)
            e.setAttribute('views', quiz.views)
            e.setAttribute('quiz-id', quiz.id)
            e.setAttribute('balanced', 'true')
            e2.classList.add('col', 'px-0')
            e2.appendChild(e)
            userHistoryRow.appendChild(e2)
            n_loaded_user_history ++;
        } else {
            loadUserHistoryBtn.classList.add('d-none')
        }
    }
    if (n_user_history == n_loaded_user_history) {
        loadUserHistoryBtn.classList.add('d-none')
    }
}

loadUserQuizzes()
loadUserHistory()