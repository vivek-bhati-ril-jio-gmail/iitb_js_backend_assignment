const apiUrl = 'http://localhost:5000/api/books'; // Update with your API endpoint
let currentPage = 1;
let itemsPerPage = 5; // Default value

async function fetchBooks(page, limit) {
    const response = await fetch(`${apiUrl}?page=${page}&limit=${limit}`);
    if (!response.ok) {
        console.error('Error fetching books:', response.statusText);
        return [];
    }
    return await response.json();
}

async function loadBooks() {
    const books = await fetchBooks(currentPage, itemsPerPage);
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = ''; // Clear existing books

    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.innerText = `Title: ${book.title}, Author: ${book.author}`;
        bookList.appendChild(bookItem);
    });

    updatePagination();
}

function updatePagination() {
    const pageInfo = document.getElementById('page-info');
    pageInfo.innerText = `Page ${currentPage}`;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.disabled = currentPage === 1;
    // You may want to set nextBtn disabled based on total pages
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
