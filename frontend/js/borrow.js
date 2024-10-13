document.getElementById('borrowForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`/api/members/${document.getElementById('memberId').value}/borrow/${document.getElementById('bookId').value}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        alert(data.msg);
    } catch (error) {
        console.error('Error:', error);
    }
});
