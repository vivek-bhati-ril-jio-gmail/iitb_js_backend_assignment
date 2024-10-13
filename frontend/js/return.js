document.getElementById('returnForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`/api/members/${document.getElementById('memberId').value}/return/${document.getElementById('bookId').value}`, {
            method: 'POST',
            headers: {
                'x-auth-token': localStorage.getItem('jwt')
            }
        });
        const data = await response.json();
        alert(data.msg);
    } catch (error) {
        console.error('Error:', error);
    }
});