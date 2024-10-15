const apiUrl = 'https://iitb-project-09adefc1d972.herokuapp.com/api/books'; // Update with your API endpoint
const bookList = document.getElementById('book-list');
const bookModal = document.getElementById('book-modal');
const bookHistoryList = document.getElementById('book-history-list');
const bookHistoryModal = document.getElementById('book-history-modal');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const numberOfCopiesInput = document.getElementById('numberOfCopies');
const updateBookBtn = document.getElementById('updateBookBtn');
const pagination = document.getElementById('pagination');
let currentBookId = '';
let currentPage = 1;
let booksPerPage = 10;

// Load Users Function
async function loadBooks(page) {
    try {
        const response = await fetch(`${apiUrl}?page=${page}&limit=${booksPerPage}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            }
        });

        const data = await response.json();
        if (response.ok) {
            displayBooks(data.books, data.totalPages);
        } else {
            alert(data.msg || 'Error fetching books list.');
            location.reload();
        }
    } catch (error) {
        console.error('Error during books list fetch:', error);
        alert('An error occurred. Please try again later.');
    }
}

async function displayBooks(books, totalPages) {
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

    // Check if historyList is an array
    if (Array.isArray(books)) {
        if (books.length === 0) {
            const noResultsItem = document.createElement('li');
            noResultsItem.textContent = 'No results found';
            noResultsItem.style.textAlign = 'center';
            noResultsItem.style.padding = '15px';
            bookList.appendChild(noResultsItem);
        } else {
            books.forEach(book => {
                const remainingCount = book.numberOfCopies - book.borrowedBy.length;
                const bookItem = document.createElement('li');
                bookItem.className = 'book-item';
                bookItem.innerHTML = `
                    <div>${book.title}</div>
                    <div>${book.author}</div>
                    <div>${remainingCount}</div>
                    <div class="button-container">
                        <button onclick='openBookHistoryModal(${JSON.stringify(book.borrowedBy).replace(/'/g, "\\'")})'>History</button>
                        <button class="edit-btn" onclick="openModal('${book._id}', '${book.title}', '${book.author}', '${book.numberOfCopies}')">Edit</button>
                        <button onclick="deleteBook('${book._id}')">Delete</button>
                    </div>
                `;
                bookList.appendChild(bookItem);
            });
        }
    } else {
        console.error('Invalid books list format:', books);
        alert('Invalid books data.');
        return;
    }

    updatePagination(totalPages);
}

// Open Modal for Editing
function openModal(id, title, author, numberOfCopies) {
    currentBookId = id;
    titleInput.value = title;
    authorInput.value = author;
    numberOfCopiesInput.value = numberOfCopies;
    bookModal.style.display = 'block'; // Show the modal
}

// Close Modal
document.querySelector('.close-btn').addEventListener('click', () => {
    bookModal.style.display = 'none'; // Hide the modal when close button is clicked
});

// Open Modal for User History
function openBookHistoryModal(historyList) {
    bookHistoryList.innerHTML = ''; // Clear existing users

    // Create header row for history
    const historyHeaderRow = document.createElement('li');
    historyHeaderRow.className = 'user-history-list-header'; // Use the header class for styling
    historyHeaderRow.innerHTML = `
        <div>User ID</div>
        <div>Action</div>
        <div>Date</div>
        <div>Time</div>
    `;
    bookHistoryList.appendChild(historyHeaderRow);

    // Check if historyList is an array
    if (Array.isArray(historyList)) {
        if (historyList.length === 0) {
            const noResultsItem = document.createElement('li');
            noResultsItem.textContent = 'No results found';
            noResultsItem.style.textAlign = 'center';
            noResultsItem.style.padding = '15px';
            bookHistoryList.appendChild(noResultsItem);
        } else {
            historyList.forEach(history => {
                const listItem = document.createElement('li');
                // Create a Date object
                const dateTime = new Date(history.date);
                listItem.innerHTML = `
                    <div>${history.userID}</div>
                    <div>${history.action}</div>
                    <div>${dateTime.toLocaleDateString()}</div>
                    <div>${dateTime.toLocaleTimeString()}</div>
                `;
                bookHistoryList.appendChild(listItem);
            });
        }
    } else {
        console.error('Invalid history list format:', historyList);
        alert('Invalid history data.');
        return;
    }
    bookHistoryModal.style.display = 'block';
}

// Close Modal
document.querySelector('.close-btn-history').addEventListener('click', () => {
    bookHistoryModal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === bookModal) {
        bookModal.style.display = 'none'; // Hide the modal if clicking outside of it
    } else if (event.target === bookHistoryModal) {
        bookHistoryModal.style.display = 'none'; // Hide the modal if clicking outside of it
    }
});

// Update Book
updateBookBtn.addEventListener('click', async () => {
    const updatedBook = {
        title: titleInput.value,
        author: authorInput.value,
        numberOfCopies: numberOfCopiesInput.value
    };
    await fetch(`https://iitb-project-09adefc1d972.herokuapp.com/api/books/${currentBookId}`, { // Corrected line
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('jwt')
        },
        body: JSON.stringify(updatedBook)
    });
    loadBooks(currentPage);
    bookModal.style.display = 'none';
});

// Delete User
async function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        const response = await fetch(`https://iitb-project-09adefc1d972.herokuapp.com/api/books/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            }
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.msg);
        } else {
            alert(data.msg || 'Error fetching books list.');
        }
        loadBooks(currentPage);
    }
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
        loadBooks(currentPage);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentPage++;
    loadBooks(currentPage);
});

// Handle items per page selection
document.getElementById('items-per-page').addEventListener('change', (event) => {
    booksPerPage = parseInt(event.target.value);
    currentPage = 1; // Reset to the first page
    loadBooks(currentPage);
});

// Initial load
loadBooks(currentPage);