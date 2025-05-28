document.getElementById('deactivateForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const upn = document.getElementById('upn').value;
    const disableDate = document.getElementById('disableDate').value;

    const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upn, disableDate })
    });

    const msg = await res.text();
    document.getElementById('message').innerText = msg;
});
