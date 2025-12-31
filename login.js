// Toggle password
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    passwordInput.type =
        passwordInput.type === 'password' ? 'text' : 'password';
});

// Submit login
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const nama = document.getElementById('nama').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!nama || !email || !password) {
        alert('Semua field wajib diisi!');
        return;
    }

    const result = loginUser(email, password);

    if (!result.success) {
        alert(result.message);
        return;
    }

    alert('Login berhasil, selamat datang ' + result.user.nama);
    window.location.href = 'dashboard.html';
});

// Redirect jika sudah login
window.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
});
