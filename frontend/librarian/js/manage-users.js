const userList = document.getElementById('user-list');
const userHistoryList = document.getElementById('user-history-list');
const userModal = document.getElementById('user-modal');
const userHistoryModal = document.getElementById('user-history-modal');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const updateUserBtn = document.getElementById('updateUserBtn');
const toggleActiveBtn = document.getElementById('toggleActiveBtn');
const pagination = document.getElementById('pagination');
let currentUserId = '';
let currentPage = 1;
let usersPerPage = 10;

// Load Users Function
async function loadUsers(page) {
    try {
        const response = await fetch(`http://localhost:5000/api/members?page=${page}&limit=${usersPerPage}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            }
        });

        const data = await response.json();
        if (response.ok) {
            displayUsers(data.users, data.totalPages);
        } else {
            alert(data.msg || 'Error fetching users list.');
            location.reload();
        }
    } catch (error) {
        console.error('Error during user list fetch:', error);
        alert('An error occurred. Please try again later.');
    }
}

// Display Users
function displayUsers(users, totalPages) {
    userList.innerHTML = ''; // Clear existing users

    // Create header row
    const headerRow = document.createElement('li');
    headerRow.className = 'user-list-header'; // Use the header class for styling
    headerRow.innerHTML = `
        <div>Username</div>
        <div>Email</div>
        <div>Status</div>
        <div>Actions</div>
    `;
    userList.appendChild(headerRow);

    if (users.length === 0) {
        const noResultsItem = document.createElement('li');
        noResultsItem.textContent = 'No results found';
        noResultsItem.style.textAlign = 'center';
        noResultsItem.style.padding = '15px';
        userList.appendChild(noResultsItem);
    } else {
        users.forEach(user => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div>${user.username}</div>
                <div>${user.email}</div>
                <div>${user.isActive ? 'Active' : 'Inactive'}</div>
                <div class="button-container">
                    <button onclick="openModal('${user._id}', '${user.username}', '${user.email}')">Edit</button>
                    <button onclick="deleteUser('${user._id}')">Delete</button>
                    <button onclick="openUserHistoryModal('${user.history}')">History</button>
                </div>
            `;
            userList.appendChild(listItem);
        });
    }
    updatePagination(totalPages);
}

// Open Modal for Editing
function openModal(id, username, email) {
    currentUserId = id;
    usernameInput.value = username;
    emailInput.value = email;
    userModal.style.display = 'block';
}

// Close Modal
document.querySelector('.close-btn').addEventListener('click', () => {
    userModal.style.display = 'none';
});

// Open Modal for User History
function openUserHistoryModal(historyList) {
    userHistoryList.innerHTML = ''; // Clear existing users

    // Create header row for history
    const historyHeaderRow = document.createElement('li');
    historyHeaderRow.className = 'user-history-list-header'; // Use the header class for styling
    historyHeaderRow.innerHTML = `
        <div>Book ID</div>
        <div>Action</div>
        <div>Date</div>
    `;
    userHistoryList.appendChild(historyHeaderRow);

    // Check if historyList is empty or undefined
    if (!historyList || historyList.length === 0) {
        const noResultsItem = document.createElement('li');
        noResultsItem.textContent = 'No results found';
        noResultsItem.style.textAlign = 'center';
        noResultsItem.style.padding = '15px';
        userHistoryList.appendChild(noResultsItem);
        userHistoryModal.style.display = 'block'; // Show modal even if no results
        return; // Exit early
    }

    // Check if historyList is a string and parse it if so
    let parsedHistoryList;
    if (typeof historyList === 'string') {
        try {
            parsedHistoryList = JSON.parse(historyList);
        } catch (error) {
            console.error('Error parsing history list:', error);
            alert('Failed to load user history. Please try again.');
            return;
        }
    } else if (Array.isArray(historyList)) {
        parsedHistoryList = historyList;
    } else {
        console.error('Invalid history list format:', historyList);
        alert('Invalid history data.');
        return;
    }

    if (parsedHistoryList.length === 0) {
        const noResultsItem = document.createElement('li');
        noResultsItem.textContent = 'No results found';
        noResultsItem.style.textAlign = 'center';
        noResultsItem.style.padding = '15px';
        userHistoryList.appendChild(noResultsItem);
    } else {
        parsedHistoryList.forEach(history => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div>${history.bookId}</div>
                <div>${history.action}</div>
                <div>${history.date}</div>
            `;
            userHistoryList.appendChild(listItem);
        });
    }
    userHistoryModal.style.display = 'block';
}

// Close Modal
document.querySelector('.close-btn-history').addEventListener('click', () => {
    userHistoryModal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === userModal) {
        userModal.style.display = 'none'; // Hide the modal if clicking outside of it
    } else if (event.target === userHistoryModal) {
        userHistoryModal.style.display = 'none'; // Hide the modal if clicking outside of it
    }
});

// Update User
updateUserBtn.addEventListener('click', async () => {
    const updatedUser = {
        username: usernameInput.value,
        email: emailInput.value,
    };
    await fetch(`http://localhost:5000/api/members/${currentUserId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser)
    });
    loadUsers(currentPage);
    userModal.style.display = 'none';
});

// Toggle Active Status
toggleActiveBtn.addEventListener('click', async () => {
    await fetch(`http://localhost:5000/api/users/${currentUserId}/toggle`, {
        method: 'PATCH'
    });
    loadUsers(currentPage);
    userModal.style.display = 'none';
});

// Delete User
async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        await fetch(`http://localhost:5000/api/users/${id}`, {
            method: 'DELETE'
        });
        loadUsers(currentPage);
    }
}

// Setup Pagination
function updatePagination(totalPages) {
    const pageInfo = document.getElementById('page-info');
    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadUsers(currentPage);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentPage++;
    loadUsers(currentPage);
});

// Handle items per page selection
document.getElementById('items-per-page').addEventListener('change', (event) => {
    usersPerPage = parseInt(event.target.value);
    currentPage = 1; // Reset to the first page
    loadUsers(currentPage);
});

// Initial load
loadUsers(currentPage);