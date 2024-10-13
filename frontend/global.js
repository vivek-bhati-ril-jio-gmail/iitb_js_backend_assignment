// header.js
async function loadHeader() {
    try {
        const response = await fetch('../utils/header.html');
        if (!response.ok) throw new Error('Network response was not ok');
        const headerHTML = await response.text();
        document.getElementById('header-container').innerHTML = headerHTML;
    } catch (error) {
        console.error('Error fetching header:', error);
    }

    // Add logout functionality
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('jwt')
                }
            });

            if (response.ok) {
                localStorage.removeItem('jwt');
                alert('Successfully logged out');
                window.location.href = '../frontend/login.html'; // Redirect to login page
            } else {
                const data = await response.json();
                alert(data.msg || 'Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Error logging out:', error);
            alert('An error occurred while logging out. Please try again later.');
        }
    });
}

// Call the loadHeader function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadHeader);
