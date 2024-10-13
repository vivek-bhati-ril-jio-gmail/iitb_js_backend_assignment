async function borrowBook(bookId) {
    try {
        const response = await fetch(`http://localhost:5000/api/books/borrow/${bookId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            }
        });

        const data = await response.json();
        if (response.ok) {
            alert(`You have borrowed the book: ${data.title}`);
            location.reload(); // Reload the page after borrowing
        } else {
            alert(data.msg || 'Failed to borrow the book.');
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        alert('An error occurred. Please try again later.');
    }
}

async function returnBook(bookId) {
    try {
        const response = await fetch(`http://localhost:5000/api/books/return/${bookId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            }
        });

        const data = await response.json();
        if (response.ok) {
            alert(`You have returned the book: ${data.title}`);
            location.reload(); // Reload the page after returning
        } else {
            alert(data.msg || 'Failed to return the book.');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        alert('An error occurred. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('dowdd');
    await fetchBorrowedBooks();
});

async function fetchBorrowedBooks() {
    try {
        const response = await fetch('http://localhost:5000/api/books/borrowed-books', { // Adjust the URL as needed
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            }
        });

        if (response.ok) {
            const borrowedBooks = await response.json();
            const bookList = document.getElementById('bookList');
            console.log(borrowedBooks);
            borrowedBooks.forEach(book => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');
                listItem.innerHTML = `
                    ${book.title}
                    <button class="btn btn-danger btn-sm float-right" onclick="returnBook('${book._id}')">Return</button>
                `;
                bookList.appendChild(listItem);
            });
        } else {
            console.error('Failed to fetch borrowed books:', response.statusText);
            // Handle error (e.g., show a message to the user)
        }
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
    }
}