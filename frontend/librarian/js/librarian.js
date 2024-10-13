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

document.getElementById('create-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const numberOfCopies = document.getElementById('numberOfCopies').value;

    try {
        const response = await fetch('http://localhost:5000/api/books', { // Adjust the URL to your backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            },
            body: JSON.stringify({ title, author, numberOfCopies })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Book added successfully!');
            // Optionally, redirect or clear the form here
            document.getElementById('create-book-form').reset();
        } else {
            alert(data.msg || 'Error adding book.');
        }
    } catch (error) {
        console.error('Error during book creation:', error);
        alert('An error occurred. Please try again later.');
    }
});
