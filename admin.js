// ========== GLOBAL VARIABLES ==========
let wasteData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 8;
let editingIndex = -1;

// TPS Navigation variables
let userLocation = null;
let tpsLocations = [];

// Check login status
window.addEventListener('load', function() {
    const loggedIn = localStorage.getItem('geodump_logged_in');
    if (!loggedIn || loggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }
});

// Handle logout
document.addEventListener('click', function(e) {
    const logoutElement = e.target.closest('.logout-item') || 
                         e.target.closest('[data-page="logout"]');
    
    if (logoutElement) {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.clear();
            showNotification('Logout berhasil!', 'success');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 300);
        }
    }
});

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', async () => {
    showLoading();
    await loadDataFromJSON();
    initializeApp();
    hideLoading();
});

// ========== LOAD DATA FROM JSON FILE ==========
async function loadDataFromJSON() {
    try {
        const response = await fetch('Titiksampah.json');
        const jsonData = await response.json();
        wasteData = jsonData.features.map(feature => feature.properties);
        filteredData = [...wasteData];
        console.log(`✅ Loaded ${wasteData.length} data points`);
    } catch (error) {
        console.error('❌ Error loading data:', error);
        useFallbackData();
    }
}

// ========== FALLBACK DATA (100 DATA) ==========
function useFallbackData() {
    console.warn('⚠️ Using fallback data (100 entries)');
    const kecamatans = ['Pekanbaru Kota', 'Sukajadi', 'Marpoyan Damai', 'Tampan'];
    const jenis = ['Organik', 'Plastik', 'Campuran'];
    const volumes = ['Kecil', 'Sedang', 'Besar'];
    
    wasteData = Array.from({ length: 100 }, (_, i) => ({
        ID_data: `dt${i + 1}`,
        Jenis_Samp: jenis[Math.floor(Math.random() * jenis.length)],
        Volume___L: volumes[Math.floor(Math.random() * volumes.length)],
        Kondisi_Li: 'Dekat (<50 m)',
        Kecamatan: kecamatans[Math.floor(Math.random() * kecamatans.length)],
        Waktu_temp: `2025-11-${String(Math.floor(Math.random() * 14) + 1).padStart(2, '0')}`,
        X: 101.4 + Math.random() * 0.1,
        Y: 0.5 + Math.random() * 0.05
    }));
    filteredData = [...wasteData];
}

// ========== INITIALIZE APP ==========
function initializeApp() {
    calculateStatistics();
    renderPieCharts();
    renderLineChart();
    initializeEventListeners();
    animateStatNumbers();
}

// ========== CALCULATE STATISTICS ==========
function calculateStatistics() {
    const totalTPS = filteredData.length;
    const volumeCounts = filteredData.reduce((acc, item) => {
        const vol = item.Volume___L;
        acc[vol] = (acc[vol] || 0) + 1;
        return acc;
    }, {});
    
    document.getElementById('totalTPS').textContent = totalTPS;
    document.getElementById('totalBesar').textContent = volumeCounts['Besar'] || 0;
    document.getElementById('totalSedang').textContent = volumeCounts['Sedang'] || 0;
    document.getElementById('totalKecil').textContent = volumeCounts['Kecil'] || 0;
}

// ========== ANIMATE STAT NUMBERS ==========
function animateStatNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(element => {
        const target = parseInt(element.textContent);
        const duration = 1500;
        const step = Math.ceil(target / (duration / 16));
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = current;
            }
        }, 16);
    });
}

// ========== RENDER PIE CHARTS ==========
function renderPieCharts() {
    const typeCounts = filteredData.reduce((acc, item) => {
        const type = item.Jenis_Samp;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    
    const total = filteredData.length;
    const organikPct = Math.round((typeCounts['Organik'] || 0) / total * 100);
    const plastikPct = Math.round((typeCounts['Plastik'] || 0) / total * 100);
    const campuranPct = Math.round((typeCounts['Campuran'] || 0) / total * 100);
    
    updatePieChart('pieOrganik', 'percentOrganik', organikPct);
    updatePieChart('piePlastik', 'percentPlastik', plastikPct);
    updatePieChart('pieCampuran', 'percentCampuran', campuranPct);
}

function updatePieChart(circleId, percentId, percentage) {
    const circle = document.getElementById(circleId);
    const percentEl = document.getElementById(percentId);
    
    if (!circle || !percentEl) return;
    
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (percentage / 100) * circumference;
    
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
        percentEl.textContent = percentage + '%';
    }, 100);
}

// ========== RENDER LINE CHART ==========
function renderLineChart() {
    const canvas = document.getElementById('lineChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const dateData = processDataByDate();
    const dates = dateData.dates;
    const counts = dateData.counts;
    const labels = dateData.labels;
    
    const chartDaysEl = document.getElementById('chartDays');
    if (chartDaysEl) {
        chartDaysEl.innerHTML = labels.map(label => `<span>${label}</span>`).join('');
    }
    
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const maxValue = Math.max(...counts) + 5;
    
    // Grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
    
    // Line chart
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    counts.forEach((value, index) => {
        const x = padding + (chartWidth / Math.max(counts.length - 1, 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Area fill
    ctx.lineTo(canvas.width - padding, padding + chartHeight);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Data points
    counts.forEach((value, index) => {
        const x = padding + (chartWidth / Math.max(counts.length - 1, 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.stroke();
    });
    
    const totalData = counts.reduce((a, b) => a + b, 0);
    const totalTodayEl = document.getElementById('totalToday');
    if (totalTodayEl) {
        totalTodayEl.textContent = totalData;
    }
    
    if (dates.length > 0) {
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];
        const dateRangeEl = document.getElementById('dateRange');
        if (dateRangeEl) {
            dateRangeEl.textContent = `${startDate} - ${endDate}`;
        }
    }
}

// ========== PROCESS DATA BY DATE ==========
function processDataByDate() {
    const dateCounts = {};
    
    filteredData.forEach(item => {
        if (item.Waktu_temp) {
            const dateStr = item.Waktu_temp.split(' ')[0];
            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        }
    });
    
    const sortedDates = Object.keys(dateCounts).sort();
    
    if (sortedDates.length === 0) {
        return { dates: [], counts: [], labels: [] };
    }
    
    const labels = sortedDates.map(dateStr => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleDateString('id-ID', { month: 'short' });
        return `${day} ${month}`;
    });
    
    const counts = sortedDates.map(date => dateCounts[date]);
    
    return { dates: sortedDates, counts: counts, labels: labels };
}

// ========== RENDER TABLE ==========
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);
    
    tableBody.innerHTML = '';
    
    pageData.forEach((item, index) => {
        const globalIndex = start + index;
        const row = document.createElement('tr');
        
        const volumeClass = item.Volume___L === 'Kecil' ? 'status-kecil' : 
                           item.Volume___L === 'Sedang' ? 'status-sedang' : 'status-besar';
        
        const date = item.Waktu_temp ? item.Waktu_temp.split(' ')[0] : 'N/A';
        const koordinat = item.X && item.Y ? `${item.Y}, ${item.X}` : 'N/A';
        
        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" data-index="${globalIndex}"></td>
            <td>${item.ID_data || 'N/A'}</td>
            <td>${date}</td>
            <td><span class="status-badge ${volumeClass}">${item.Volume___L || 'N/A'}</span></td>
            <td>${koordinat}</td>
            <td>${item.Kondisi_Li || 'N/A'}</td>
            <td>${item.Jenis_Samp || 'N/A'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="editRow(${globalIndex})">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteRow(${globalIndex})">🗑️</button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    updateTableInfo();
    renderPagination();
}

// ========== UPDATE TABLE INFO ==========
function updateTableInfo() {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(start + itemsPerPage - 1, filteredData.length);
    
    document.getElementById('showingStart').textContent = start;
    document.getElementById('showingEnd').textContent = end;
    document.getElementById('totalEntries').textContent = filteredData.length;
}

// ========== RENDER PAGINATION ==========
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    pagination.innerHTML = '';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    pagination.appendChild(prevBtn);
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-btn' + (i === currentPage ? ' active' : '');
            pageBtn.textContent = i;
            pageBtn.onclick = () => changePage(i);
            pagination.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.padding = '0 8px';
            pagination.appendChild(dots);
        }
    }
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => changePage(currentPage + 1);
    pagination.appendChild(nextBtn);
}

// ========== CHANGE PAGE ==========
function changePage(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
    }
}

// ========== OPEN ADD MODAL ==========
function openAddModal() {
    document.getElementById('addIdData').value = '';
    document.getElementById('addJenis').value = 'Organik';
    document.getElementById('addVolume').value = 'Kecil';
    document.getElementById('addKondisi').value = '';
    document.getElementById('addKecamatan').value = '';
    document.getElementById('addLatitude').value = '';
    document.getElementById('addLongitude').value = '';
    document.getElementById('addWaktu').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('addModal').classList.remove('hidden');
}

// ========== CLOSE ADD MODAL ==========
function closeAddModal() {
    document.getElementById('addModal').classList.add('hidden');
}

// ========== SAVE NEW DATA ==========
function saveNewData() {
    const idData = document.getElementById('addIdData').value.trim();
    const jenis = document.getElementById('addJenis').value;
    const volume = document.getElementById('addVolume').value;
    const kondisi = document.getElementById('addKondisi').value.trim();
    const kecamatan = document.getElementById('addKecamatan').value.trim();
    const latitude = parseFloat(document.getElementById('addLatitude').value);
    const longitude = parseFloat(document.getElementById('addLongitude').value);
    const waktu = document.getElementById('addWaktu').value;
    
    if (!idData || !kondisi || !kecamatan || isNaN(latitude) || isNaN(longitude) || !waktu) {
        showNotification('Mohon lengkapi semua field yang diperlukan!', 'error');
        return;
    }
    
    const isDuplicate = wasteData.some(item => item.ID_data === idData);
    if (isDuplicate) {
        showNotification('ID Data sudah ada! Gunakan ID yang berbeda.', 'error');
        return;
    }
    
    const newData = {
        ID_data: idData,
        Jenis_Samp: jenis,
        Volume___L: volume,
        Kondisi_Li: kondisi,
        Kecamatan: kecamatan,
        Y: latitude,
        X: longitude,
        Waktu_temp: waktu
    };
    
    wasteData.unshift(newData);
    filteredData.unshift(newData);
    
    currentPage = 1;
    
    closeAddModal();
    renderTable();
    calculateStatistics();
    renderPieCharts();
    renderLineChart();
    animateStatNumbers();
    
    showNotification('✅ Data baru berhasil ditambahkan!', 'success');
}

// ========== EDIT ROW ==========
function editRow(index) {
    editingIndex = index;
    const item = filteredData[index];
    
    document.getElementById('editIndex').value = index;
    document.getElementById('editJenis').value = item.Jenis_Samp || '';
    document.getElementById('editVolume').value = item.Volume___L || '';
    document.getElementById('editKondisi').value = item.Kondisi_Li || '';
    document.getElementById('editKecamatan').value = item.Kecamatan || '';
    
    document.getElementById('editModal').classList.remove('hidden');
}

// ========== CLOSE EDIT MODAL ==========
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    editingIndex = -1;
}

// ========== UPDATE DATA ==========
function updateData() {
    if (editingIndex === -1) return;
    
    const jenis = document.getElementById('editJenis').value;
    const volume = document.getElementById('editVolume').value;
    const kondisi = document.getElementById('editKondisi').value.trim();
    const kecamatan = document.getElementById('editKecamatan').value.trim();
    
    if (!kondisi || !kecamatan) {
        showNotification('Mohon lengkapi semua field!', 'error');
        return;
    }
    
    filteredData[editingIndex].Jenis_Samp = jenis;
    filteredData[editingIndex].Volume___L = volume;
    filteredData[editingIndex].Kondisi_Li = kondisi;
    filteredData[editingIndex].Kecamatan = kecamatan;
    
    const originalIndex = wasteData.findIndex(item => 
        item.ID_data === filteredData[editingIndex].ID_data
    );
    if (originalIndex !== -1) {
        wasteData[originalIndex] = {...filteredData[editingIndex]};
    }
    
    closeEditModal();
    renderTable();
    calculateStatistics();
    renderPieCharts();
    renderLineChart();
    animateStatNumbers();
    
    showNotification('✅ Data berhasil diupdate!', 'success');
}

// ========== DELETE ROW ==========
function deleteRow(index) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        const deletedItem = filteredData[index];
        
        filteredData.splice(index, 1);
        
        const originalIndex = wasteData.findIndex(item => item.ID_data === deletedItem.ID_data);
        if (originalIndex !== -1) {
            wasteData.splice(originalIndex, 1);
        }
        
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage > totalPages && currentPage > 1) {
            currentPage = totalPages;
        }
        
        renderTable();
        calculateStatistics();
        renderPieCharts();
        renderLineChart();
        animateStatNumbers();
        
        showNotification('🗑️ Data berhasil dihapus', 'success');
    }
}

// ========== EVENT LISTENERS ==========
function initializeEventListeners() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavigation(item);
        });
    });
    
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
    
    const periodFilter = document.getElementById('periodFilter');
    periodFilter.addEventListener('change', handlePeriodFilter);
    
    const btnDownload = document.getElementById('btnDownload');
    if (btnDownload) {
        btnDownload.addEventListener('click', downloadData);
    }
    
    const btnAddData = document.getElementById('btnAddData');
    if (btnAddData) {
        btnAddData.addEventListener('click', openAddModal);
    }
    
    const addModalClose = document.getElementById('addModalClose');
    if (addModalClose) {
        addModalClose.addEventListener('click', closeAddModal);
    }
    
    const addModalOverlay = document.getElementById('addModalOverlay');
    if (addModalOverlay) {
        addModalOverlay.addEventListener('click', closeAddModal);
    }
    
    const btnAddCancel = document.getElementById('btnAddCancel');
    if (btnAddCancel) {
        btnAddCancel.addEventListener('click', closeAddModal);
    }
    
    const btnAddSave = document.getElementById('btnAddSave');
    if (btnAddSave) {
        btnAddSave.addEventListener('click', saveNewData);
    }
    
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeEditModal);
    }
    
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeEditModal);
    }
    
    const btnCancel = document.getElementById('btnCancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', closeEditModal);
    }
    
    const btnSave = document.getElementById('btnSave');
    if (btnSave) {
        btnSave.addEventListener('click', updateData);
    }
    
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.row-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }
}

// ========== HANDLE NAVIGATION ==========
function handleNavigation(item) {
    const page = item.dataset.page;
    
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('active');
    });
    item.classList.add('active');
    
    document.querySelectorAll('.page-content').forEach(el => {
        el.classList.add('hidden');
    });
    
    const pageTitle = document.getElementById('pageTitle');
    
    switch(page) {
        case 'dashboard':
            pageTitle.textContent = 'Dashboard';
            document.getElementById('dashboardPage').classList.remove('hidden');
            break;
        case 'table':
            pageTitle.textContent = 'Tabel Lokasi';
            document.getElementById('tablePage').classList.remove('hidden');
            renderTable();
            break;
        case 'illegal':
            pageTitle.textContent = 'Lokasi TPS';
            document.getElementById('illegalPage').classList.remove('hidden');
            setTimeout(() => {
                initTPSNavigation();
            }, 100);
            break;
        case 'logout':
            if (confirm('Apakah Anda yakin ingin keluar?')) {
                showNotification('Logout berhasil', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
            break;
    }
}

// ========== SEARCH FUNCTIONALITY ==========
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredData = [...wasteData];
    } else {
        filteredData = wasteData.filter(item => {
            const kecamatan = (item.Kecamatan || '').toLowerCase();
            const jenis = (item.Jenis_Samp || '').toLowerCase();
            const idData = (item.ID_data || '').toLowerCase();
            
            return kecamatan.includes(searchTerm) || jenis.includes(searchTerm) || idData.includes(searchTerm);
        });
    }
    
    currentPage = 1;
    calculateStatistics();
    renderPieCharts();
    renderLineChart();
    animateStatNumbers();
    
    if (!document.getElementById('tablePage').classList.contains('hidden')) {
        renderTable();
    }
}

// ========== PERIOD FILTER ==========
function handlePeriodFilter(e) {
    const days = parseInt(e.target.value);
    const today = new Date();
    const startDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
    
    filteredData = wasteData.filter(item => {
        if (item.Waktu_temp) {
            const dateStr = item.Waktu_temp.split(' ')[0];
            const itemDate = new Date(dateStr);
            return itemDate >= startDate && itemDate <= today;
        }
        return false;
    });
    
    if (filteredData.length === 0) {
        filteredData = [...wasteData];
    }
    
    currentPage = 1;
    calculateStatistics();
    renderPieCharts();
    renderLineChart();
    animateStatNumbers();
    
    if (!document.getElementById('tablePage').classList.contains('hidden')) {
        renderTable();
    }
}

// ========== DOWNLOAD DATA ==========
function downloadData() {
    const dataStr = JSON.stringify({
        type: "FeatureCollection",
        features: filteredData.map((item, index) => ({
            type: "Feature",
            id: index,
            properties: item
        }))
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ogeodump_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('📥 Data berhasil didownload!', 'success');
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 30px;
        padding: 16px 24px;
        background: ${colors[type]};
        color: white;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.4s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// ========== LOADING FUNCTIONS ==========
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }, 500);
}

// ========== ANIMATIONS CSS ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ========== TPS NAVIGATION FUNCTIONALITY ==========

function initTPSNavigation() {
    populateKecamatanFilter();
    setupTPSEventListeners();
    processTPS();
}

function populateKecamatanFilter() {
    const kecamatans = [...new Set(wasteData.map(item => item.Kecamatan))].filter(Boolean).sort();
    const filterSelect = document.getElementById('filterKecamatan');
    
    if (!filterSelect) return;
    
    filterSelect.innerHTML = '<option value="">Semua Kecamatan</option>';
    kecamatans.forEach(kec => {
        const option = document.createElement('option');
        option.value = kec;
        option.textContent = kec;
        filterSelect.appendChild(option);
    });
}

function setupTPSEventListeners() {
    const btnGetLocation = document.getElementById('btnGetLocation');
    const btnRefreshMap = document.getElementById('btnRefreshMap');
    const btnSortDistance = document.getElementById('btnSortDistance');
    const searchTPS = document.getElementById('searchTPS');
    const filterKecamatan = document.getElementById('filterKecamatan');
    
    if (btnGetLocation) {
        btnGetLocation.addEventListener('click', getUserLocation);
    }
    
    if (btnRefreshMap) {
        btnRefreshMap.addEventListener('click', refreshMap);
    }
    
    if (btnSortDistance) {
        btnSortDistance.addEventListener('click', toggleSortDistance);
    }
    
    if (searchTPS) {
        searchTPS.addEventListener('input', filterTPSList);
    }
    
    if (filterKecamatan) {
        filterKecamatan.addEventListener('change', filterTPSList);
    }
}

function getUserLocation() {
    if (!navigator.geolocation) {
        showNotification('❌ Browser Anda tidak mendukung geolokasi', 'error');
        return;
    }
    
    showNotification('📍 Mendapatkan lokasi Anda...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            showNotification('✅ Lokasi berhasil didapatkan!', 'success');
            processTPS();
            renderMap();
            renderTPSList();
        },
        (error) => {
            let errorMsg = 'Gagal mendapatkan lokasi';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = 'Izin lokasi ditolak. Mohon aktifkan izin lokasi.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'Informasi lokasi tidak tersedia.';
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Permintaan lokasi timeout.';
                    break;
            }
            showNotification('❌ ' + errorMsg, 'error');
        }
    );
}

function processTPS() {
    tpsLocations = wasteData.map((item, index) => {
        let distance = null;
        if (userLocation && item.Y && item.X) {
            distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                item.Y,
                item.X
            );
        }
        
        return {
            ...item,
            index,
            distance
        };
    }).filter(item => item.Y && item.X);
    
    if (userLocation) {
        tpsLocations.sort((a, b) => a.distance - b.distance);
    }
    
    updateTPSStats();
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

function updateTPSStats() {
    const tpsCount = document.getElementById('tpsCount');
    const nearestDistance = document.getElementById('nearestDistance');
    
    if (tpsCount) {
        tpsCount.textContent = tpsLocations.length;
    }
    
    if (nearestDistance && tpsLocations.length > 0 && tpsLocations[0].distance) {
        nearestDistance.textContent = tpsLocations[0].distance.toFixed(2) + ' km';
    } else if (nearestDistance) {
        nearestDistance.textContent = '-';
    }
}

// ========== RENDER MAP WITH RESPONSIVE CANVAS ==========
function renderMap() {
    const mapElement = document.getElementById('tpsMap');
    if (!mapElement) return;
    
    mapElement.innerHTML = '';
    
    if (!userLocation || tpsLocations.length === 0) {
        mapElement.innerHTML = `
            <div class="map-placeholder">
                <div class="placeholder-icon">🗺️</div>
                <p>Klik "Lokasi Saya" untuk memulai navigasi</p>
            </div>
        `;
        return;
    }
    
    const canvasContainer = document.createElement('div');
    canvasContainer.style.width = '100%';
    canvasContainer.style.height = '100%';
    canvasContainer.style.position = 'relative';
    mapElement.appendChild(canvasContainer);
    
    const mapCanvas = document.createElement('canvas');
    mapCanvas.style.width = '100%';
    mapCanvas.style.height = '100%';
    mapCanvas.style.display = 'block';
    canvasContainer.appendChild(mapCanvas);
    
    const containerWidth = canvasContainer.offsetWidth;
    const containerHeight = canvasContainer.offsetHeight;
    
    const dpr = window.devicePixelRatio || 1;
    mapCanvas.width = containerWidth * dpr;
    mapCanvas.height = containerHeight * dpr;
    
    const ctx = mapCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    drawMapContent(ctx, containerWidth, containerHeight);
}

function drawMapContent(ctx, width, height) {
    const displayTPS = tpsLocations.slice(0, 10);
    const lats = [userLocation.lat, ...displayTPS.map(t => t.Y)];
    const lngs = [userLocation.lng, ...displayTPS.map(t => t.X)];
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;
    
    const padding = Math.min(width, height) * 0.08;
    
    const toCanvasX = (lng) => {
        return padding + ((lng - (minLng - lngPadding)) / ((maxLng + lngPadding) - (minLng - lngPadding))) * (width - padding * 2);
    };
    
    const toCanvasY = (lat) => {
        return height - padding - ((lat - (minLat - latPadding)) / ((maxLat + latPadding) - (minLat - latPadding))) * (height - padding * 2);
    };
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#e0f2fe');
    gradient.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    
    for (let i = 0; i <= 10; i++) {
        const x = padding + (width - padding * 2) * i / 10;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
        
        const y = padding + (height - padding * 2) * i / 10;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    ctx.setLineDash([]);
    
    const userX = toCanvasX(userLocation.lng);
    const userY = toCanvasY(userLocation.lat);
    
    const markerScale = Math.min(width, height) / 600;
    const baseMarkerSize = 8 * markerScale;
    const userMarkerSize = 10 * markerScale;
    
    displayTPS.slice(0, 3).forEach((tps, index) => {
        const tpsX = toCanvasX(tps.X);
        const tpsY = toCanvasY(tps.Y);
        
        ctx.strokeStyle = index === 0 ? '#10b981' : '#94a3b8';
        ctx.lineWidth = index === 0 ? 3 * markerScale : 1.5 * markerScale;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(userX, userY);
        ctx.lineTo(tpsX, tpsY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        const midX = (userX + tpsX) / 2;
        const midY = (userY + tpsY) / 2;
        
        const labelWidth = 60 * markerScale;
        const labelHeight = 20 * markerScale;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(midX - labelWidth/2, midY - labelHeight/2, labelWidth, labelHeight);
        
        ctx.fillStyle = index === 0 ? '#10b981' : '#64748b';
        ctx.font = `bold ${11 * markerScale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${tps.distance.toFixed(1)} km`, midX, midY);
    });
    
    displayTPS.forEach((tps, index) => {
        const x = toCanvasX(tps.X);
        const y = toCanvasY(tps.Y);
        
        const size = index === 0 ? baseMarkerSize * 1.5 : baseMarkerSize;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(x + 2 * markerScale, y + 2 * markerScale, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = index === 0 ? '#fbbf24' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3 * markerScale;
        ctx.stroke();
        
        if (index === 0) {
            ctx.fillStyle = '#1f2937';
            ctx.font = `bold ${13 * markerScale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('★ TERDEKAT', x, y - size - 5);
        }
        
        if (index < 5 && width > 400) {
            ctx.fillStyle = '#475569';
            ctx.font = `${10 * markerScale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(tps.ID_data || `#${index + 1}`, x, y + size + 5);
        }
    });
    
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.beginPath();
    ctx.arc(userX, userY, userMarkerSize * 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.beginPath();
    ctx.arc(userX, userY, userMarkerSize * 1.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(userX, userY, userMarkerSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3 * markerScale;
    ctx.stroke();
    
    const labelWidth = 70 * markerScale;
    const labelHeight = 22 * markerScale;
    const labelY = userY + userMarkerSize + 10 * markerScale;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(userX - labelWidth/2, labelY, labelWidth, labelHeight);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2 * markerScale;
    ctx.strokeRect(userX - labelWidth/2, labelY, labelWidth, labelHeight);
    
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${12 * markerScale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📍 ANDA', userX, labelY + labelHeight/2);
    
    if (width > 400) {
        drawCompass(ctx, width - 60 * markerScale, 60 * markerScale, markerScale);
    }
    
    drawScale(ctx, padding, height - 30 * markerScale, minLng, maxLng, lngPadding, markerScale, width);
}

function drawCompass(ctx, x, y, scale = 1) {
    const size = 40 * scale;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x, y - size / 2 + 5 * scale);
    ctx.lineTo(x - 5 * scale, y);
    ctx.lineTo(x, y - 5 * scale);
    ctx.lineTo(x + 5 * scale, y);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(x, y + size / 2 - 5 * scale);
    ctx.lineTo(x - 5 * scale, y);
    ctx.lineTo(x, y + 5 * scale);
    ctx.lineTo(x + 5 * scale, y);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${10 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('N', x, y - size / 2 + 2 * scale);
}

function drawScale(ctx, x, y, minLng, maxLng, padding, scale, width) {
    const scaleWidth = Math.min(100 * scale, width * 0.2);
    const realDistance = calculateDistance(0, minLng - padding, 0, minLng - padding + (maxLng - minLng + padding * 2) * (scaleWidth / (width * 0.75)));
    
    const boxWidth = scaleWidth + 20 * scale;
    const boxHeight = 30 * scale;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(x, y - boxHeight/2, boxWidth, boxHeight);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(x, y - boxHeight/2, boxWidth, boxHeight);
    
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 10 * scale, y);
    ctx.lineTo(x + 10 * scale + scaleWidth, y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + 10 * scale, y - 5 * scale);
    ctx.lineTo(x + 10 * scale, y + 5 * scale);
    ctx.moveTo(x + 10 * scale + scaleWidth, y - 5 * scale);
    ctx.lineTo(x + 10 * scale + scaleWidth, y + 5 * scale);
    ctx.stroke();
    
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${10 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${realDistance.toFixed(1)} km`, x + 10 * scale + scaleWidth / 2, y + 12 * scale);
}

function renderTPSList() {
    const tpsList = document.getElementById('tpsList');
    if (!tpsList) return;
    
    let displayLocations = [...tpsLocations];
    
    const searchTerm = document.getElementById('searchTPS')?.value.toLowerCase() || '';
    const selectedKecamatan = document.getElementById('filterKecamatan')?.value || '';
    
    if (searchTerm) {
        displayLocations = displayLocations.filter(tps => 
            (tps.ID_data || '').toLowerCase().includes(searchTerm) ||
            (tps.Kecamatan || '').toLowerCase().includes(searchTerm) ||
            (tps.Kondisi_Li || '').toLowerCase().includes(searchTerm)
        );
    }
    
    if (selectedKecamatan) {
        displayLocations = displayLocations.filter(tps => tps.Kecamatan === selectedKecamatan);
    }
    
    if (displayLocations.length === 0) {
        tpsList.innerHTML = `
            <div class="empty-list">
                <div class="empty-icon">📍</div>
                <p>Tidak ada TPS ditemukan</p>
            </div>
        `;
        return;
    }
    
    tpsList.innerHTML = '';
    
    displayLocations.forEach((tps, index) => {
        const isNearest = index === 0 && userLocation;
        const item = document.createElement('div');
        item.className = 'tps-item' + (isNearest ? ' nearest' : '');
        
        const distanceText = tps.distance ? `${tps.distance.toFixed(2)} km` : '-';
        
        item.innerHTML = `
            <div class="tps-item-header">
                <div class="tps-item-title">
                    <span>🗑️</span>
                    <span>${tps.ID_data || 'TPS-' + (index + 1)}</span>
                </div>
                ${isNearest ? '<span class="tps-badge nearest">⭐ Terdekat</span>' : `<span class="tps-badge">${distanceText}</span>`}
            </div>
            <div class="tps-item-details">
                <div class="tps-detail">
                    <span class="tps-detail-icon">📍</span>
                    <span>${tps.Kecamatan || 'N/A'}</span>
                </div>
                <div class="tps-detail">
                    <span class="tps-detail-icon">🗺️</span>
                    <span>${tps.Y.toFixed(6)}, ${tps.X.toFixed(6)}</span>
                </div>
                <div class="tps-detail">
                    <span class="tps-detail-icon">📦</span>
                    <span>${tps.Volume___L || 'N/A'} - ${tps.Jenis_Samp || 'N/A'}</span>
                </div>
            </div>
            <div class="tps-item-footer">
                <button class="btn-navigate" onclick="navigateToTPS(${tps.Y}, ${tps.X})">
                    🧭 Navigate
                </button>
                <button class="btn-info" onclick="showTPSInfo(${tps.index})">
                    ℹ️ Info
                </button>
            </div>
        `;
        
        tpsList.appendChild(item);
    });
}

function navigateToTPS(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
    showNotification('🗺️ Membuka Google Maps...', 'info');
}

function showTPSInfo(index) {
    const tps = wasteData[index];
    if (!tps) return;
    
    const info = `
📍 ID: ${tps.ID_data || 'N/A'}
📅 Tanggal: ${tps.Waktu_temp ? tps.Waktu_temp.split(' ')[0] : 'N/A'}
📦 Volume: ${tps.Volume___L || 'N/A'}
🗑️ Jenis: ${tps.Jenis_Samp || 'N/A'}
🌳 Kondisi: ${tps.Kondisi_Li || 'N/A'}
📍 Kecamatan: ${tps.Kecamatan || 'N/A'}
🗺️ Koordinat: ${tps.Y}, ${tps.X}
    `;
    
    alert(info);
}

function toggleSortDistance() {
    sortAscending = !sortAscending;
    
    if (tpsLocations[0]?.distance !== null) {
        tpsLocations.sort((a, b) => {
            return sortAscending ? a.distance - b.distance : b.distance - a.distance;
        });
    }
    
    const arrow = document.querySelector('.sort-arrow');
    if (arrow) {
        arrow.textContent = sortAscending ? '↑' : '↓';
    }
    
    renderTPSList();
    showNotification(`📊 Diurutkan ${sortAscending ? 'terdekat ke terjauh' : 'terjauh ke terdekat'}`, 'info');
}

function filterTPSList() {
    renderTPSList();
}

function refreshMap() {
    showNotification('🔄 Memperbarui peta...', 'info');
    processTPS();
    renderMap();
    renderTPSList();
    setTimeout(() => {
        showNotification('✅ Peta berhasil diperbarui!', 'success');
    }, 500);
}

// ========== HANDLE WINDOW RESIZE ==========
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!document.getElementById('illegalPage').classList.contains('hidden')) {
            renderMap();
        }
    }, 250);
});

// ========== LOG INFO ==========
console.log('%c🗑️ OGEODUMP Dashboard', 'font-size: 20px; font-weight: bold; color: #10b981;');
console.log('%c📊 Dashboard loaded successfully!', 'font-size: 14px; color: #6b7280;');
console.log('%c✅ Data source: Titiksampah.json', 'font-size: 12px; color: #059669;');
console.log('%c🗺️ TPS Navigation Module Ready', 'font-size: 16px; font-weight: bold; color: #10b981;');