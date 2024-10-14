document.getElementById('memberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('https://iitb-project-09adefc1d972.herokuapp.com/api/members', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            })
        });
        const data = await response.json();
        alert(data.msg);
        loadMembers(); // Refresh the member list
    } catch (error) {
        console.error('Error:', error);
    }
});

async function loadMembers() {
    try {
        const response = await fetch('https://iitb-project-09adefc1d972.herokuapp.com/api/members', {
            headers: {
                'x-auth-token': localStorage.getItem('jwt')
            }
        });
        const members = await response.json();
        const membersList = document.getElementById('membersList');
        membersList.innerHTML = '<h4>Members List</h4>';
        members.forEach(member => {
            membersList.innerHTML += `<div>${member.username} (${member.email})</div>`;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}
loadMembers(); // Load members on page load