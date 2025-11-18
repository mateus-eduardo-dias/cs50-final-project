class QuizElementDeletable extends HTMLElement {
    constructor() {
        super();
    }
    // profile.js has deleteQuiz()
    // TODO: Lógica para deletar quiz

    connectedCallback() {
        const col_size = this.getAttribute('balanced') == 'true' ? 'col' : 'col-6'
        const elementBody = `<div class="row row-cols-auto justify-content-between border rounded py-2 my-1 mx-1 d-flex">
                        <div class="${col_size}">
                            <div><i class="bi bi-chat-square-text me-2"></i><strong class="fs-5">${this.getAttribute('name')}</strong></div>
                            <div><i class="bi bi-person-circle me-2"></i><a href="/profile/${this.getAttribute('user-id')}"><span>${this.getAttribute('author')}</span></a></div>
                            <div><i class="bi bi-eye me-2"></i><span>${this.getAttribute('views')}</span></div>
                        </div>
                        <div class="${col_size} justify-content-center">
                            <div class="row align-self-start my-1"><a href="/quiz/${this.getAttribute('quiz-id')}"><button class="btn btn-primary btn-schema-3 px-2 py-1">Join</button></a></div>
                            <button class="btn btn-outline-danger my-1" type="button" onclick="deleteQuizUI(${this.getAttribute('quiz-id')}, '${this.getAttribute('name')}')"><i class="bi bi-trash3"></i></button>
                        </div>
                    </div>`
        this.innerHTML = elementBody
    }
}
class QuizElement extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        const col_size = this.getAttribute('balanced') == 'true' ? 'col' : 'col-6'
        const elementBody = `<div class="row row-cols-auto justify-content-between border rounded py-2 my-1 mx-1 d-flex">
                        <div class="${col_size}">
                            <div><i class="bi bi-chat-square-text me-2"></i><strong class="fs-5">${this.getAttribute('name')}</strong></div>
                            <div><i class="bi bi-person-circle me-2"></i><a href="/profile/${this.getAttribute('user-id')}"><span>${this.getAttribute('author')}</span></a></div>
                            <div><i class="bi bi-eye me-2"></i><span>${this.getAttribute('views')}</span></div>
                        </div>
                        <div class="${col_size} d-flex align-items-center">
                            <a href="/quiz/${this.getAttribute('quiz-id')}"><button class="btn btn-primary btn-schema-3 px-2 py-1">Join</button></a>
                        </div>
                    </div>`
        this.innerHTML = elementBody
    }
}

customElements.define('quiz-element', QuizElement)
customElements.define('quiz-element-del', QuizElementDeletable)

