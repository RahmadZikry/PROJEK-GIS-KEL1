// Toggle Password Visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

toggleConfirmPassword.addEventListener('click', function() {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

// Form Validation and Submit
const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const nama = document.getElementById('nama').value.trim();
    const alamat = document.getElementById('alamat').value.trim();
    const email = document.getElementById('email').value.trim();
    const handphone = document.getElementById('handphone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!nama || !alamat || !email || !handphone || !password || !confirmPassword) {
        showNotification('Mohon lengkapi semua field!', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Format email tidak valid!', 'error');
        return;
    }
    
    // Phone validation (Indonesian format)
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(handphone.replace(/[-\s]/g, ''))) {
        showNotification('Format nomor handphone tidak valid!', 'error');
        return;
    }
    
    // Password validation
    if (password.length < 6) {
        showNotification('Password minimal 6 karakter!', 'error');
        return;
    }
    
    // Password match validation
    if (password !== confirmPassword) {
        showNotification('Password dan konfirmasi password tidak sama!', 'error');
        return;
    }
    
    // Simulate registration process
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.querySelector('span').textContent;
    submitBtn.querySelector('span').textContent = 'Mendaftar...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Registrasi berhasil! Selamat datang ' + nama, 'success');
        
        // Save to localStorage
        const userData = {
            nama: nama,
            alamat: alamat,
            email: email,
            handphone: handphone
        };
        localStorage.setItem('geodump_user', JSON.stringify(userData));
        
        // Reset form and button
        submitBtn.querySelector('span').textContent = originalText;
        submitBtn.disabled = false;
        signupForm.reset();
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
        console.log('Registration data:', userData);
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

// Real-time password match indicator
confirmPasswordInput.addEventListener('input', function() {
    const password = passwordInput.value;
    const confirmPassword = this.value;
    
    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            this.style.borderColor = '#22c55e';
        } else {
            this.style.borderColor = '#ef4444';
        }
    } else {
        this.style.borderColor = '#e5e7eb';
    }
});

// Notification system
function showNotification(message, type) {
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
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
        maxWidth: '350px'
    });
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }
    
    document.body.appendChild(notification);
    
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

// Phone number formatting
const handphoneInput = document.getElementById('handphone');
handphoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    // Auto add +62 or 0 prefix
    if (value.length > 0 && value[0] !== '0' && !value.startsWith('62')) {
        value = '0' + value;
    }
    
    e.target.value = value;
});