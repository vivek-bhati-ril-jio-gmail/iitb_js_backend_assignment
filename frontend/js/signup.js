document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('https://iitb-project-09adefc1d972.herokuapp.com/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                email: document.getElementById('email').value,
                role: document.getElementById('role').value
            })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.msg);
            // Handle successful signup (e.g., redirect to login)
            window.location.href = 'login.html';
        } else {
            // Handle errors (e.g., show error message)
            alert(data.msg);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});