document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', { // Adjust the URL based on your backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.role === 'LIBRARIAN') {
                    window.location.href = '../librarian/librarian.html'; // Navigate to librarian dashboard
                } else if (data.role === 'MEMBER') {
                    window.location.href = '../members/members.html'; // Navigate to member dashboard
                }
            } else {
                alert(data.msg || 'Invalid credentials.'); // Show error message
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});
