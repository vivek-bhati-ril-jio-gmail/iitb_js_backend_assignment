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
        console.log(response);
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