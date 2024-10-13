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
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('jwt', data.jwt); // Store the JWT in local storage
                // Store user role in local storage
                localStorage.setItem('userRole', data.role);
                window.location.href = '../users/users.html'; // Navigate to the appropriate dashboard
            } else {
                alert(data.msg || 'Invalid credentials.'); // Show error message
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});
