/* ===============================
   DATABASE LOCALSTORAGE GEODUMP
================================ */

const DB_USERS = 'geodump_users';
const DB_SESSION = 'geodump_session';

/* ===== INIT DATABASE ===== */
function initDatabase() {
    if (!localStorage.getItem(DB_USERS)) {
        localStorage.setItem(DB_USERS, JSON.stringify([]));
    }
}
initDatabase();

/* ===== GET USERS ===== */
function getUsers() {
    return JSON.parse(localStorage.getItem(DB_USERS)) || [];
}

/* ===== SAVE USERS ===== */
function saveUsers(users) {
    localStorage.setItem(DB_USERS, JSON.stringify(users));
}

/* ===== REGISTER ===== */
function registerUser(nama, email, password) {
    const users = getUsers();

    const exists = users.find(u => u.email === email);
    if (exists) {
        return { success: false, message: 'Email sudah terdaftar!' };
    }

    const newUser = {
        id: Date.now(),
        nama,
        email,
        password,
        role: 'user',
        created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true };
}

/* ===== LOGIN ===== */
function loginUser(email, password) {
    const users = getUsers();

    const user = users.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        return { success: false, message: 'Email atau password salah!' };
    }

    localStorage.setItem(DB_SESSION, JSON.stringify(user));
    return { success: true, user };
}

/* ===== SESSION ===== */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(DB_SESSION));
}

function isLoggedIn() {
    return !!localStorage.getItem(DB_SESSION);
}

function logoutUser() {
    localStorage.removeItem(DB_SESSION);
}
