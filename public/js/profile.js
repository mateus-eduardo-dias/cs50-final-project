const userQuizzesRow = document.getElementById("user-quizzes-row")
const userHistoryRow = document.getElementById("user-history-row")
const loadUserQuizzesBtn = document.getElementById("loadUserQuizzesBtn")
const loadUserHistoryBtn = document.getElementById("loadUserHistoryBtn")

const modal = new bootstrap.Modal(document.getElementById('infoModal'))
const modalTitle = document.getElementById('modalTitle')
const modalMsg = document.getElementById('modalMsg')

const errorModal = new bootstrap.Modal(document.getElementById('errorModal'))
const errorModalMsg = document.getElementById('errorModalMsg')

const successModal = new bootstrap.Modal(document.getElementById('successModal'))
const successModalMsg = document.getElementById('successModalMsg')

console.log(userInfo)

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
            const e = userInfo.yourId == userInfo.id ? document.createElement('quiz-element-del') : document.createElement('quiz-element')
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
            break;
        }
    }
}

function loadUserHistory() {
    for (let i = 0; i < 5; i++) {
        if (n_user_history > n_loaded_user_history) {
            const quiz = userInfo.quiz_history[n_loaded_user_history]
            const e = document.createElement('quiz-element')
            const e2 = document.createElement('div')
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

let toDelete;
function deleteQuizUI(qid, qname) {
    modalTitle.textContent = `Delete Quiz '${qname}'`
    modalMsg.textContent = `Are you sure you want to delete the quiz "${qname}"?`
    modal.show()
    toDelete = qid
}
function deleteQuiz() {
    if (toDelete == undefined) {
        // TODO: Error
        return;
    }
    const passwordInput = document.getElementById('passwordInput').value
    if (typeof passwordInput != 'string' || !(/^[A-Z_0-9.@#$%^&+=!-]{4,30}$/i.test(passwordInput))) {
        // TODO: Error
        return;
    } else {
        fetch('/api/quiz', {method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:toDelete, password:passwordInput})})
        .then((res) => {
            switch (res.status) {
                case 400:
                    errorModalMsg.textContent = 'A error happened. Try again later.'
                    errorModal.show()
                    return;
                case 401:
                    window.location.href = '/login?status=7'
                    return;
                case 403:
                    errorModalMsg.textContent = 'Unauthorized - Failed to validate credentials'
                    errorModal.show()
                    console.log(1)
                    return;
                case 404:
                    errorModalMsg.textContent = 'Quiz not found'
                    errorModal.show()
                    return;
                case 500:
                    errorModalMsg.textContent = 'Server Internal Error. Try again later.'
                    errorModal.show()
                    return;
                case 200:
                    return res.json();
            }
        })
        .then((data) =>  {
            if (data) {
                successModalMsg.textContent = `Quiz deleted; ID=${data.deleted}`
                successModal.show()
                return;
            }
        })
        .catch((err) => {
            errorModalMsg.textContent = 'Network Error. Try again later.'
            errorModal.show()
        })
    }
}

loadUserQuizzes()
loadUserHistory()