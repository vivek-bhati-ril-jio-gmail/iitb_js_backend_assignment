const userList = document.getElementById('user-list');
const userHistoryList = document.getElementById('user-history-list');
const userModal = document.getElementById('user-modal');
const userHistoryModal = document.getElementById('user-history-modal');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const updateUserBtn = document.getElementById('updateUserBtn');
const toggleActiveBtn = document.getElementById('toggleActiveBtn');
const pagination = document.getElementById('pagination');
const isActiveInput = document.getElementById('user-status');
let currentUserId = '';
let currentPage = 1;
let usersPerPage = 10;

// Load Users Function
async function loadUsers(page) {
    try {
        const response = await fetch(`https://iitb-project-09adefc1d972.herokuapp.com/api/members?page=${page}&limit=${usersPerPage}`, {
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
                    <button onclick='openUserHistoryModal(${JSON.stringify(user.history).replace(/'/g, "\\'")})'>History</button>
                    <button onclick="openModal('${user._id}', '${user.username}', '${user.email}')">Edit</button>
                    <button onclick="deleteUser('${user._id}')">Delete</button>
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
        <div>Time</div>
    `;
    userHistoryList.appendChild(historyHeaderRow);

    // Check if historyList is an array
    if (Array.isArray(historyList)) {
        if (historyList.length === 0) {
            const noResultsItem = document.createElement('li');
            noResultsItem.textContent = 'No results found';
            noResultsItem.style.textAlign = 'center';
            noResultsItem.style.padding = '15px';
            userHistoryList.appendChild(noResultsItem);
        } else {
            historyList.forEach(history => {
                const listItem = document.createElement('li');
                // Create a Date object
                const dateTime = new Date(history.date);
                listItem.innerHTML = `
                    <div>${history.bookId}</div>
                    <div>${history.action}</div>
                    <div>${dateTime.toLocaleDateString()}</div>
                    <div>${dateTime.toLocaleTimeString()}</div>
                `;
                userHistoryList.appendChild(listItem);
            });
        }
    } else {
        console.error('Invalid history list format:', historyList);
        alert('Invalid history data.');
        return;
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
        isActive: isActiveInput.value
    };
    await fetch(`https://iitb-project-09adefc1d972.herokuapp.com/api/members/${currentUserId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('jwt')
        },
        body: JSON.stringify(updatedUser)
    });
    loadUsers(currentPage);
    userModal.style.display = 'none';
});

// Delete User
async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        const response = await fetch(`https://iitb-project-09adefc1d972.herokuapp.com/api/members/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            },
        });
        const data = await response.json();
        alert(data.msg);
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