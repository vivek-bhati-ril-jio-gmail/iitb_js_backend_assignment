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

async function borrowBook(bookId) {
    try {
        const response = await fetch(`${apiUrl}/borrow/${bookId}`, { // Adjust the URL for borrowing a book
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            }
        });

        const data = await response.json();
        if (response.ok) {
            alert(`You have borrowed the book: ${data.title}`);
            window.location.reload(); // Reload the page to refresh the book list
        } else {
            alert(data.msg || 'Failed to borrow the book.');
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        alert('An error occurred while borrowing the book. Please try again later.');
    }
}

async function loadBooks() {
    const { totalBooks, totalPages, books } = await fetchBooks(currentPage, itemsPerPage);
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = ''; // Clear existing books

    // Create header row
    const headerRow = document.createElement('li');
    headerRow.className = 'book-list-header';
    headerRow.innerHTML = `
        <div>Title</div>
        <div>Author</div>
        <div>Remaining Count</div>
        <div>Actions</div>
    `;
    bookList.appendChild(headerRow);

    if (books.length === 0) {
        const noResultsItem = document.createElement('li');
        noResultsItem.textContent = 'No results found';
        noResultsItem.style.textAlign = 'center';
        noResultsItem.style.padding = '15px';
        bookList.appendChild(noResultsItem);
    } else {
        books.forEach(book => {
            const remainingCount = getAvailableCount(book.borrowedBy, book.numberOfCopies);
            const bookItem = document.createElement('li');
            bookItem.className = 'book-item';
            bookItem.innerHTML = `
                <div>${book.title}</div>
                <div>${book.author}</div>
                <div>${remainingCount}</div>
                <div class="button-container">
                    <button class="borrow-btn" onclick="borrowBook('${book._id}')">Borrow</button>
                </div>
            `;
            bookList.appendChild(bookItem);
        });
    }

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

function getAvailableCount(borrowedBy, numberOfCopies) {
    // Count how many times 'BORROWED' appears in the array
    const borrowedCount = borrowedBy.filter(borrow => borrow.action === 'BORROWED').length;
    
    // Count how many times 'RETURNED' appears in the array
    const returnedCount = borrowedBy.filter(borrow => borrow.action === 'RETURNED').length;

    // Calculate available count
    const availableCount = numberOfCopies - (borrowedCount - returnedCount);
    
    return availableCount;
}

// Initial load
loadBooks();