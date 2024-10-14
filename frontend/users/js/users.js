document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    console.log(userRole);
    // Show role-specific button
    const roleButtonContainer = document.getElementById('role-specific-btn-container');
    if (userRole === 'LIBRARIAN') {
        const librarianButton = document.createElement('button');
        librarianButton.textContent = 'Go to Librarian Dashboard';
        librarianButton.addEventListener('click', () => {
            window.location.href = '../../librarian/librarian.html'; // Adjust the path accordingly
        });
        roleButtonContainer.appendChild(librarianButton);
    }
});