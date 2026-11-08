document.addEventListener('DOMContentLoaded', () => {
    // Si ya hay sesión, redirigir al admin
    fetch('/api/session')
        .then(r => r.json())
        .then(data => {
            if (data.ok) window.location.href = 'admin.html';
        });

    const form = document.getElementById('login-form');
    const error = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        error.textContent = '';

        const user = document.getElementById('user').value.trim();
        const pass = document.getElementById('pass').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, pass })
            });

            const data = await res.json();

            if (data.ok) {
                window.location.href = 'admin.html';
            } else {
                error.textContent = data.error || 'Error al iniciar sesión';
            }
        } catch (err) {
            error.textContent = 'Error de conexión con el servidor';
        }
    });
});