document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5000/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                numberOfCopies: document.getElementById('numberOfCopies').value
            })
        });
        const data = await response.json();
        alert(data.msg);
    } catch (error) {
        console.error('Error:', error);
    }
});

async function loadBooks() {
    try {
        const response = await fetch('http://localhost:5000/api/books', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const books = await response.json();
        const booksList = document.getElementById('booksList');
        booksList.innerHTML = '<h4>Books List</h4>';
        books.forEach(book => {
            const numberOfCopies = getAvailableCount(books.borrowedBy, book.numberOfCopies);
            booksList.innerHTML += `<div>${book.title} by ${book.author} - Available: ${numberOfCopies}</div>`;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function getAvailableCount(borrowedBy, numberOfCopies) {
    // Count how many times 'BORROWED' appears in the array
    const borrowedCount = borrowedBy.filter(borrow => borrow.action === 'BORROWED').length;
    
    // Count how many times 'RETURNED' appears in the array
    const returnedCount = borrowedBy.filter(borrow => borrow.action === 'RETURNED').length;

    // Calculate available count
    const availableCount = numberOfCopies - (borrowedCount - returnedCount);
    
    return availableCount;
}

loadBooks(); // Load books on page load