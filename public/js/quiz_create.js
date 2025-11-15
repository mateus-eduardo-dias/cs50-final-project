class QuestionForm extends HTMLElement {
    static get observedAttributes() {
        return ['qid']
    }

    constructor() {
        super();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.id = `question-${this.getAttribute('qid')}Element`
        const elementBody = `<div class="row my-3 justify-content-center" id='question-${this.getAttribute('qid')}Box'>
                <div class="col-sm-6">
                    <form class="border rounded p-3">
                        <div class="row justify-content-evenly">
                            <div class="col-8">
                                <span class="font-monospace fs-5 fw-bold fst-italic">Question no.${this.getAttribute('qid')}</span>
                            </div>
                            <div class="col-4 text-end">
                                <button type="button" class="btn-close" onclick="removeQuestion(${this.getAttribute('qid')})"></button>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="mb-3">
                                <label for="questionName-${this.getAttribute('qid')}Input" class="form-label">Question: </label>
                                <input type="text" id="questionName-${this.getAttribute('qid')}Input" value="${oldVal == null ? '' : document.getElementById(`questionName-${oldVal}Input`).value}">
                            </div>
                            <div class="col-xl-4 mb-3">
                                <label for="opt1-${this.getAttribute('qid')}Input" class="form-label">Option 1: </label>
                                <input type="text" id="opt1-${this.getAttribute('qid')}Input" value="${oldVal == null ? '' : document.getElementById(`opt1-${oldVal}Input`).value}">
                            </div>
                            <div class="col-xl-4 mb-3">
                                <label for="opt2-${this.getAttribute('qid')}Input" class="form-label">Option 2: </label>
                                <input type="text" id="opt2-${this.getAttribute('qid')}Input" value="${oldVal == null ? '' : document.getElementById(`opt2-${oldVal}Input`).value}">
                            </div>
                            <div class="col-xl-4 mb-3">
                                <label for="opt3-${this.getAttribute('qid')}Input" class="form-label">Option 3: </label>
                                <input type="text" id="opt3-${this.getAttribute('qid')}Input" value="${oldVal == null ? '' : document.getElementById(`opt3-${oldVal}Input`).value}">
                            </div>
                            <div class="col-xl-4 mb-3">
                                <label for="opt4-${this.getAttribute('qid')}Input" class="form-label">Option 4: </label>
                                <input type="text" id="opt4-${this.getAttribute('qid')}Input" value="${oldVal == null ? '' : document.getElementById(`opt4-${oldVal}Input`).value}">
                            </div>
                            <label for="answer-${this.getAttribute('qid')}Select" class="form-label">Answer:</label>
                            <select class="form-select w-50" id="answer-${this.getAttribute('qid')}Select">
                                <option selected value="0">Option 1</option>
                                <option value="1">Option 2</option>
                                <option value="2">Option 3</option>
                                <option value="3">Option 4</option>
                            </select>
                        </div>
                    </form>
                </div>
            </div>`

        this.innerHTML = elementBody
    }
}

customElements.define('question-form', QuestionForm)

const modal = new bootstrap.Modal(document.getElementById('errorModal'))
const modalMsg = document.getElementById('errorModalMsg')

const questionsContainer = document.getElementById('questions-container')
let n_questions = 1

document.getElementById('addQuestionBtn').addEventListener('click', function () {
    n_questions ++;
    const e = document.createElement('question-form')
    e.setAttribute('qid', n_questions)
    questionsContainer.appendChild(e)
})

function removeQuestion(qid) {
    document.getElementById(`question-${qid}Element`).remove()
    for (let i = parseInt(qid) + 1; i <= n_questions; i++) {
        document.getElementById(`question-${i}Element`).setAttribute('qid', i - 1)
    }
    n_questions --;
}

function submitQuiz() {
    const questions = []
    const titlePattern = /^.{5,}$/i
    const title = document.getElementById('quizNameInput').value

    if (typeof title != "string" || !titlePattern.test(title)) {
        modalMsg.textContent = `Title should have at least 5 characters`
        modal.show()
        return;
    }

    const pattern = /^.{1,}$/i

    for (let i = 1; i <= n_questions; i++) {
        const question = document.getElementById(`questionName-${i}Input`).value
        if (typeof question != 'string' || !pattern.test(question)) {
            modalMsg.textContent = `<p>Each question title should have at least one character.</p><p>Question no.${i}</p>`
            modal.show()
            return;
        }
        
        const options = [document.getElementById(`opt1-${i}Input`).value, document.getElementById(`opt2-${i}Input`).value, 
            document.getElementById(`opt3-${i}Input`).value, document.getElementById(`opt4-${i}Input`).value]
        if (typeof options[0] != "string" || typeof options[1] != "string" || typeof options[2] != "string" || typeof options[3] != "string") {
            modalMsg.innerHTML = `<p>A option is invalid.</p><p>Question no.${i}</p>`
            modal.show()
            return;
        } else if (!pattern.test(options[0]) || !pattern.test(options[1]) || !pattern.test(options[2]) || !pattern.test(options[3])) {
            modalMsg.innerHTML = `<p>Each option should have at least one character.</p><p>Question no.${i}</p>`
            modal.show()
            return;
        }

        const answer = document.getElementById(`answer-${i}Select`).value
        if (isNaN(answer) || typeof answer != 'string') {
            modalMsg.textContent = `Answer for Question no.${i} not found`
            modal.show()
            return;
        }
        const int_answer = parseInt(answer)
        if (int_answer < 0 || int_answer > 3) {
            modalMsg.textContent = `Answer for Question no.${i} not found`
            modal.show()
            return;
        }

        questions.push({ question, options, answer: int_answer})
    }

    const body = {
        title, questions
    }

    fetch('/api/quiz', {'method': 'POST', 'headers': {'Content-Type': 'application/json'}, body: JSON.stringify(body)})
    .then((resp) => {
        if (resp.status == 401) {
            window.location.href = `/login?status=7`
        } else if (resp.status == 400) {
            modalMsg.textContent = "Bad request: Try again later."
            modal.show()
        } else if (resp.status == 500) {
            modalMsg.textContent = "A error has happened, try again later."
            modal.show()
        } else if (resp.status == 204) {
            modalMsg.textContent = "Quiz was not created, try again later."
            modal.show()
        } else {
            return resp.json()
        }
    })
    .then((data) => {
        if (data != undefined) {
            window.location.href = `/quiz/create/success?id=${data.id}`
        } else {
            modalMsg.textContent = "Unknown error."
            modal.show()
        }
    })
    .catch((err) => {
        modalMsg.textContent = "Network error, try again later."
        modal.show()
    })
}