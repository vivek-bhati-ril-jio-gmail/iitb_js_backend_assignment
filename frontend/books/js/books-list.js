const apiUrl = 'http://localhost:5000/api/books'; // Update with your API endpoint
let currentPage = 1;
let itemsPerPage = 10; // Default value

async function fetchBooks(page, limit) {
    try {
        const response = await fetch(`${apiUrl}?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            }
        });
        
        if (response.ok) {
            return response.json();
        } else {
            alert(`Please try again later.`);
            window.history.back();
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        alert('An error occurred. Please try again later.');
        window.history.back();
    }
}

async function loadBooks() {
    const { totalBooks, totalPages, books } = await fetchBooks(currentPage, itemsPerPage);
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = ''; // Clear existing books

    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.innerText = `Title: ${book.title}, Author: ${book.author}`;
        bookList.appendChild(bookItem);
    });

    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    const pageInfo = document.getElementById('page-info');
    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages; // Disable if on the last page
}

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadBooks();
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentPage++;
    loadBooks();
});

// Handle items per page selection
document.getElementById('items-per-page').addEventListener('change', (event) => {
    itemsPerPage = parseInt(event.target.value);
    currentPage = 1; // Reset to the first page
    loadBooks();
});

// Initial load
loadBooks();