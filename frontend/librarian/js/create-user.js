document.getElementById('create-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        const response = await fetch('http://localhost:5000/api/members', { // Adjust the URL to your backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            },
            body: JSON.stringify({ username, email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            alert('User created successfully!');
            // Optionally, redirect or clear the form here
            document.getElementById('create-user-form').reset();
        } else {
            alert(data.msg || 'Error creating user.');
            location.reload(); // Reload the page after borrowing
        }
    } catch (error) {
        console.error('Error during user creation:', error);
        alert('An error occurred. Please try again later.');
    }
});