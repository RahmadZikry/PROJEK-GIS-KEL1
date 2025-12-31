/* ===== TOGGLE PASSWORD ===== */
document.getElementById('togglePassword').addEventListener('click', () => {
    const pwd = document.getElementById('password');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
});

document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
    const pwd = document.getElementById('confirmPassword');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
});

/* ===== SIGNUP ===== */
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    const alamat = document.getElementById('alamat').value.trim();
    const email = document.getElementById('email').value.trim();
    const handphone = document.getElementById('handphone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!nama || !alamat || !email || !handphone || !password || !confirmPassword) {
        alert('Semua field wajib diisi!');
        return;
    }

    if (password.length < 6) {
        alert('Password minimal 6 karakter!');
        return;
    }

    if (password !== confirmPassword) {
        alert('Konfirmasi password tidak cocok!');
        return;
    }

    // Simpan ke database local (pakai fungsi yang sudah ada)
    const result = registerUser(nama, email, password);

    if (!result.success) {
        alert(result.message);
        return;
    }

    // Simpan data tambahan (alamat & hp) ke user terakhir
    const users = getUsers();
    users[users.length - 1].alamat = alamat;
    users[users.length - 1].handphone = handphone;
    saveUsers(users);

    alert('Registrasi berhasil! Silakan login.');
    window.location.href = 'login.html';
});
