document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');

    // Show role-specific button
    const roleButtonContainer = document.getElementById('role-specific-btn-container');
    if (userRole === 'LIBRARIAN') {
        const librarianButton = document.createElement('button');
        librarianButton.textContent = 'Go to Librarian Dashboard';
        librarianButton.addEventListener('click', () => {
            window.location.href = '../../librarian/librarian.html'; // Adjust the path accordingly
        });
        roleButtonContainer.appendChild(librarianButton);
    } else if (userRole === 'MEMBER') {
        const memberButton = document.createElement('button');
        memberButton.textContent = 'Go to Member Dashboard';
        memberButton.addEventListener('click', () => {
            window.location.href = 'users-books.html'; // Adjust the path accordingly
        });
        roleButtonContainer.appendChild(memberButton);
    }
});