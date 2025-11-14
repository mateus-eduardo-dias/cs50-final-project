const title = document.getElementById('title')
const quizBox = document.getElementById('quiz-container')
const resultBox = document.getElementById('quiz-result')

const modal = new bootstrap.Modal(document.getElementById('errorModal'))
const modalMsg = document.getElementById('errorModalMsg')

title.textContent = quizInfo.title

class QuizQuestion extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const questionid = this.getAttribute('qid')
        const elementBody = `<div class="row my-4 justify-content-center">
                <div class="col-lg-9 border rounded py-2">
                <div class="text-center fw-bold">${this.getAttribute('question')}</div>
                <div class="row mt-3 mb-2 justify-content-around text-center text-break">
                    <div class="col-2 border rounded py-2 quiz-button" onclick="choose(${questionid}, 0)" id="quiz-${questionid}-0">${this.getAttribute('a1')}</div>
                    <div class="col-2 border rounded py-2 quiz-button" onclick="choose(${questionid}, 1)" id="quiz-${questionid}-1">${this.getAttribute('a2')}</div>
                    <div class="col-2 border rounded py-2 quiz-button" onclick="choose(${questionid}, 2)" id="quiz-${questionid}-2">${this.getAttribute('a3')}</div>
                    <div class="col-2 border rounded py-2 quiz-button" onclick="choose(${questionid}, 3)" id="quiz-${questionid}-3">${this.getAttribute('a4')}</div>
                </div>
                </div>
            </div>`
        this.innerHTML = elementBody
    }
}

customElements.define('quiz-question', QuizQuestion)

let n_questions = 0
let quizOptions = []
let quizOptionsId = []

function choose(qid, option) {
    document.getElementById(`quiz-${qid}-${option}`).classList.remove('quiz-wrong')

    if (quizOptions[qid] != null) {
        document.getElementById(`quiz-${qid}-${quizOptionsId[qid]}`).classList.remove('quiz-choosed')
    }
    quizOptions[qid] = quizInfo.questions[qid].options[option]
    quizOptionsId[qid] = option
    document.getElementById(`quiz-${qid}-${option}`).classList.add('quiz-choosed')

    console.log("-- REGISTERED --")
    console.log(quizOptions)
    console.log(quizOptionsId)
}

for (let i in quizInfo.questions) {
    n_questions += 1
    quizOptions[i] = null
    quizOptionsId[i] = null
    const question = quizInfo.questions[i]
    const e = document.createElement('quiz-question')
    e.setAttribute('question', question.question)
    e.setAttribute('a1', question.options[0])
    e.setAttribute('a2', question.options[1])
    e.setAttribute('a3', question.options[2])
    e.setAttribute('a4', question.options[3])
    e.setAttribute('qid', i)
    quizBox.appendChild(e)
}

console.log(quizOptions)
console.log(quizOptionsId)

function submitQuiz() {
    for (let i in quizOptions)  {
        if (quizOptions[i] == null) {
            modalMsg.textContent = `Question no.${i+1} has no answer.`
            modal.show()
            return;
        }
    }

    fetch(`/api/validate/quiz/${window.location.pathname.split('/')[2]}`, {'method':'POST', 'headers': {'Content-Type': 'application/json'},'body': JSON.stringify({"answers": quizOptions})})
    .then((resp) => {
        if (resp.status == 401) {
            window.location.href = `/login?status=6`
        } else if (resp.status == 400) {
            modalMsg.textContent = `Something went wrong. Try again later.`
            modal.show()
        } else if (resp.status == 500) {
            modalMsg.textContent = `Server error. Try again later`
            modal.show()
        } else if (resp.status == 404) {
            modalMsg.textContent = `Questions validation failed. Try again later`
            modal.show()
        } else {
            return resp.json()
        }
    })
    .then((data) => {
        if (data.correct < data.questions) {
            for (let wrong_question of data.info) {
                document.getElementById(`quiz-${wrong_question.question_id}-${wrong_question.answer_id}`).classList.add('quiz-wrong')
            }
            resultBox.textContent = `You got ${data.correct} of ${data.questions} (${data.correct / data.questions * 100}%)`
            return;
        }

        resultBox.textContent = "Congratulations! You've got all the questions right!"
    })
    .catch((err) => {
        console.log(err)
        console.log(err.status)
    })
}