const serversBox = document.getElementById('serversBox')
const modal = new bootstrap.Modal(document.getElementById('errorModal'))

fetch('/api/quizzes')
.then((resp) => {
    return resp.json()
})
.then((data) => {
    for (let i = 0; i < data.size; i++) {
        const e = document.createElement('quiz-element')
        e.setAttribute('name', data.list[i].title)
        e.setAttribute('author', data.list[i].username)
        e.setAttribute('quiz-id', data.list[i].id)
        e.setAttribute('views', data.list[i].views)
        e.setAttribute('user-id', data.list[i].userid)
        e.setAttribute('balanced', 'true')
        serversBox.appendChild(e)
    }
})
.catch((err) => {
    modal.show()
})