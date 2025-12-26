// Toggle Password Visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle emoji
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

// Form Validation and Submit
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const nama = document.getElementById('nama').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Validation
    if (!nama || !email || !password) {
        showNotification('Mohon lengkapi semua field!', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Format email tidak valid!', 'error');
        return;
    }
    
    // Password validation (minimal 6 karakter)
    if (password.length < 6) {
        showNotification('Password minimal 6 karakter!', 'error');
        return;
    }
    
    // Simulate login process
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.querySelector('span').textContent;
    submitBtn.querySelector('span').textContent = 'Sedang Login...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Login berhasil! Selamat datang ' + nama, 'success');
        
        // Save to localStorage if remember me is checked
        if (remember) {
            localStorage.setItem('geodump_email', email);
            localStorage.setItem('geodump_nama', nama);
        }
        
        // Save login session
        localStorage.setItem('geodump_logged_in', 'true');
        localStorage.setItem('geodump_current_user', JSON.stringify({ nama, email }));
        
        // Reset button
        submitBtn.querySelector('span').textContent = originalText;
        submitBtn.disabled = false;
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
        console.log('Login data:', { nama, email, remember });
    }, 1500);
});

// Add input animation
const inputs = document.querySelectorAll('.form-group input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.parentElement.classList.remove('focused');
        }
    });
});

// Notification system
function showNotification(message, type) {
    // Remove existing notification
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '500',
        fontSize: '14px',
        zIndex: '9999',
        animation: 'slideIn 0.3s ease',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        maxWidth: '300px'
    });
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Load saved data if exists
window.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const loggedIn = localStorage.getItem('geodump_logged_in');
    if (loggedIn === 'true') {
        // Redirect to dashboard if already logged in
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Load saved email and nama if exists
    const savedEmail = localStorage.getItem('geodump_email');
    const savedNama = localStorage.getItem('geodump_nama');
    
    if (savedEmail) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('remember').checked = true;
    }
    
    if (savedNama) {
        document.getElementById('nama').value = savedNama;
    }
});

// Google Sign In (Placeholder - perlu implementasi Google OAuth)
const googleBtn = document.querySelector('.google-btn');
googleBtn.addEventListener('click', function() {
    showNotification('Fitur Google Sign In akan segera tersedia!', 'error');
    // Implementasi Google OAuth bisa ditambahkan di sini
});

// Forgot Password
const passwordHint = document.querySelector('.password-hint');
if (passwordHint) {
    passwordHint.addEventListener('click', function() {
        const email = document.getElementById('email').value;
        if (!email) {
            showNotification('Masukkan email terlebih dahulu!', 'error');
        } else {
            showNotification('Link reset password telah dikirim ke ' + email, 'success');
        }
    });
}