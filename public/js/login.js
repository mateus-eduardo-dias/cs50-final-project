const form = document.getElementById('login-form')

form.onsubmit = (e) => {
    const username = document.getElementById('usernameInput').value
    const password = document.getElementById('passwordInput').value
    if (typeof username != 'string' || typeof password != 'string') {
        window.location.href = '/login?status=1'
        e.preventDefault()
    } else if (!(/^[A-Z_0-9.]{5,15}$/i.test(username))) {
        window.location.href = '/login?status=2'
        e.preventDefault()
    } else if (!(/^[A-Z_0-9.@#$%^&+=!-]{6,30}$/i.test(password))) {
        window.location.href = '/login?status=3'
        e.preventDefault()
    }
}