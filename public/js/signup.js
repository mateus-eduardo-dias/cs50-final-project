const form = document.getElementById('signup-form')

form.onsubmit = (e) => {
    const username = document.getElementById('usernameInput').value
    const password = document.getElementById('passwordInput').value
    const cpassword = document.getElementById('confirmPasswordInput').value
    if (typeof username != 'string' || typeof password != 'string' || typeof cpassword != 'string') {
        window.location.href = '/signup?status=1'
        e.preventDefault()
    } else if (!(/^[A-Z_0-9.]{5,15}$/i.test(username))) {
        window.location.href = '/signup?status=2'
        e.preventDefault()
    } else if (!(/^[A-Z_0-9.@#$%^&+=!-]{4,30}$/i.test(password))) {
        window.location.href = '/signup?status=3'
        e.preventDefault()
    } else if (password != cpassword) {
        window.location.href = '/signup?status=4'
        e.preventDefault()
    }
}