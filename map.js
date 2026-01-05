// ============================================
// Map Configuration
// ============================================
let map;
let polygonLayer;
let markerLayer;
let tpsLayer;
let allPolygonData = [];
let allMarkerData = [];
let allTpsData = [];
let markers = [];
let tpsMarkers = [];
let tpsVisible = true;  // Track TPS visibility

// Inisialisasi Map
function initMap() {
    map = L.map('map').setView([0.507068, 101.447777], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    polygonLayer = L.layerGroup().addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    tpsLayer = L.layerGroup().addTo(map);
    loadPolygonData();
    loadMarkerData();
    loadTpsData();
}

// ============================================
// Load Polygon Kecamatan
// ============================================
async function loadPolygonData() {
    try {
        const response = await fetch('data/polygon_kecamatan.json');
        const data = await response.json();

        allPolygonData = data.features || [];

        // Populate filter dropdown
        populateKecamatanFilter(allPolygonData);

        // Render polygons
        renderPolygons(allPolygonData);

    } catch (error) {
        console.error('Error loading polygon data:', error);
        showNotification('Gagal memuat data polygon kecamatan', 'error');
    }
}

// Render Polygons
function renderPolygons(features) {
    polygonLayer.clearLayers();

    features.forEach((feature, index) => {
        const coords = feature.geometry.coordinates;
        let latLngs;

        // Convert coordinates (GeoJSON uses [lon, lat], Leaflet uses [lat, lon])
        if (feature.geometry.type === 'Polygon') {
            latLngs = coords[0].map(coord => [coord[1], coord[0]]);
        } else if (feature.geometry.type === 'MultiPolygon') {
            latLngs = coords.map(polygon =>
                polygon[0].map(coord => [coord[1], coord[0]])
            );
        }

        // Color interpolation
        const colorValue = index / features.length;
        const color = interpolateColor(colorValue);

        const polygon = L.polygon(latLngs, {
            color: '#1a6b4a',
            weight: 2,
            fillColor: color,
            fillOpacity: 0.3
        }).addTo(polygonLayer);

        // Popup untuk polygon
        const kecamatan = feature.properties.KECAMATAN || feature.properties.KABUPATEN || 'Unknown';
        polygon.bindPopup(`
            <div class="custom-popup">
                <h4><i class="fas fa-map-marker-alt"></i> ${kecamatan}</h4>
                <p><strong>Object ID:</strong> ${feature.properties.OBJECTID || '-'}</p>
            </div>
        `);

        // Hover effect
        polygon.on('mouseover', function (e) {
            this.setStyle({
                weight: 3,
                fillOpacity: 0.5
            });
        });

        polygon.on('mouseout', function (e) {
            this.setStyle({
                weight: 2,
                fillOpacity: 0.3
            });
        });
    });
}

// Interpolate color
function interpolateColor(value) {
    const colors = [
        [255, 255, 51],   // Yellow
        [51, 88, 255]     // Blue
    ];

    const r = Math.round(colors[0][0] + (colors[1][0] - colors[0][0]) * value);
    const g = Math.round(colors[0][1] + (colors[1][1] - colors[0][1]) * value);
    const b = Math.round(colors[0][2] + (colors[1][2] - colors[0][2]) * value);

    return `rgb(${r}, ${g}, ${b})`;
}

// ============================================
// Load Titik Sampah
// ============================================
async function loadMarkerData() {
    try {
        const response = await fetch('data/Titiksampah.json');
        const data = await response.json();
        allMarkerData = data.features || [];
        console.log('✅ Loaded', allMarkerData.length, 'marker data');
        renderMarkers(allMarkerData);
        updateStatistics(allMarkerData, allTpsData);
        populateTable(allMarkerData);
    } catch (error) {
        console.error('Error loading marker data:', error);
        showNotification('Gagal memuat data titik sampah', 'error');
    }
}

// Render Markers
function renderMarkers(features) {
    markerLayer.clearLayers();
    markers = [];

    features.forEach((feature, index) => {
        const coords = feature.geometry.coordinates;
        const lat = coords[1];
        const lon = coords[0];

        const props = feature.properties;

        // Custom icon berdasarkan volume - PERHATIKAN nama field: Volume___L bukan Volume
        const volume = props['Volume___L'] || 'Sedang';
        const iconColor = getVolumeColor(volume);

        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin" style="background: ${iconColor};">
                       <i class="fas fa-trash"></i>
                   </div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -42]
        });

        const marker = L.marker([lat, lon], { icon: customIcon }).addTo(markerLayer);

        // Popup content - SESUAIKAN dengan nama field yang benar
        const lokasi = props.Lokasi || 'Lokasi Sampah';
        const jenis = props.Jenis_Samp || '-';
        const kondisi = props.Kondisi_Li || '-';
        const waktu = props.Waktu_temp || '-';
        const kecamatan = props.Kecamatan || '-';

        // Ambil nama jalan singkat dari lokasi (bagian pertama sebelum "Kecamatan")
        const lokasiSingkat = lokasi.split('Kecamatan')[0].trim();
        const namaLokasi = lokasiSingkat.length > 50
            ? lokasiSingkat.substring(0, 50) + '...'
            : lokasiSingkat;

        marker.bindPopup(`
            <div class="custom-popup waste-popup">
                <div class="popup-header">
                    <i class="fas fa-map-pin"></i>
                    <h4>Titik Sampah Ilegal</h4>
                </div>
                <div class="popup-content">
                    <div class="popup-row">
                        <i class="fas fa-location-dot"></i>
                        <span><strong>Alamat:</strong> ${namaLokasi}</span>
                    </div>
                    <div class="popup-row">
                        <i class="fas fa-map-marked-alt"></i>
                        <span><strong>Kecamatan:</strong> ${kecamatan}</span>
                    </div>
                    <div class="popup-row">
                        <i class="fas fa-recycle"></i>
                        <span><strong>Jenis:</strong> ${jenis}</span>
                    </div>
                    <div class="popup-row">
                        <i class="fas fa-box"></i>
                        <span><strong>Volume:</strong> ${volume}</span>
                    </div>
                    <div class="popup-row">
                        <i class="fas fa-info-circle"></i>
                        <span><strong>Kondisi:</strong> ${kondisi}</span>
                    </div>
                    <div class="popup-row">
                        <i class="fas fa-clock"></i>
                        <span><strong>Waktu:</strong> ${waktu}</span>
                    </div>
                </div>
                <div class="popup-footer">
                    <button class="btn-detail" onclick="showDetail(${index})">
                        <i class="fas fa-info"></i> Detail
                    </button>
                </div>
            </div>
        `);

        markers.push({
            marker: marker,
            data: feature
        });
    });

    console.log('✅ Rendered', markers.length, 'markers on map');
}

// Get color based on volume
function getVolumeColor(volume) {
    const vol = volume.toLowerCase();
    if (vol.includes('besar')) {
        return '#e74c3c';
    } else if (vol.includes('sedang')) {
        return '#f39c12';
    } else if (vol.includes('kecil')) {
        return '#2ecc71';
    }
    return '#95a5a6';
}

// ============================================
// Filters
// ============================================
function populateKecamatanFilter(features) {
    const select = document.getElementById('filterKecamatan');
    if (!select) return;
    const kecamatans = new Set();
    allMarkerData.forEach(feature => {
        const kecamatan = feature.properties.Kecamatan;
        if (kecamatan) kecamatans.add(kecamatan);
    });
    Array.from(kecamatans).sort().forEach(kec => {
        const option = document.createElement('option');
        option.value = kec;
        option.textContent = kec;
        select.appendChild(option);
    });
}



// Reset Filters
function resetFilters() {
    const filterKec = document.getElementById('filterKecamatan');
    const filterJenis = document.getElementById('filterJenis');
    const filterVol = document.getElementById('filterVolume');

    if (filterKec) filterKec.value = 'all';
    if (filterJenis) filterJenis.value = 'all';
    if (filterVol) filterVol.value = 'all';

    renderMarkers(allMarkerData);
    populateTable(allMarkerData);
    updateStatistics(allMarkerData, allTpsData);

    showNotification('Filter berhasil direset', 'success');
}



// Update stats section dengan animasi
function updateStatsSection(data) {
    // Total titik sampah
    const statTotalLokasi = document.getElementById('stat-total-lokasi');
    if (statTotalLokasi) {
        const target = data.length;
        statTotalLokasi.setAttribute('data-target', target);
        animateStatsCounter(statTotalLokasi, 0, target, 2000);
    }

    // Total kecamatan
    const kecamatans = new Set(data.map(f => f.properties.Kecamatan).filter(Boolean));
    const statTotalKecamatan = document.getElementById('stat-total-kecamatan');
    if (statTotalKecamatan) {
        const target = kecamatans.size;
        statTotalKecamatan.setAttribute('data-target', target);
        animateStatsCounter(statTotalKecamatan, 0, target, 2000);
    }

    // Sampah volume besar
    const sampahBesar = data.filter(f =>
        (f.properties['Volume___L'] || '').toLowerCase() === 'besar'
    ).length;
    const statSampahBesar = document.getElementById('stat-sampah-besar');
    if (statSampahBesar) {
        statSampahBesar.setAttribute('data-target', sampahBesar);
        animateStatsCounter(statSampahBesar, 0, sampahBesar, 2000);
    }

    // Sampah campuran
    const sampahCampuran = data.filter(f =>
        (f.properties.Jenis_Samp || '').toLowerCase() === 'campuran'
    ).length;
    const statJenisCampuran = document.getElementById('stat-jenis-campuran');
    if (statJenisCampuran) {
        statJenisCampuran.setAttribute('data-target', sampahCampuran);
        animateStatsCounter(statJenisCampuran, 0, sampahCampuran, 2000);
    }

    // Update progress circles
    updateProgressCircles(data);
}

// Update progress circles
function updateProgressCircles(data) {
    const circles = document.querySelectorAll('.stat-circle-progress');

    if (circles.length >= 4) {
        // Circle 1: Persentase dari maksimal 150
        const percent1 = Math.min((data.length / 150) * 100, 100);
        updateCircle(circles[0], percent1);

        // Circle 2: Persentase kecamatan dari maksimal 12
        const kecamatans = new Set(data.map(f => f.properties.Kecamatan).filter(Boolean));
        const percent2 = Math.min((kecamatans.size / 12) * 100, 100);
        updateCircle(circles[1], percent2);

        // Circle 3: Persentase sampah besar
        const sampahBesar = data.filter(f =>
            (f.properties['Volume___L'] || '').toLowerCase() === 'besar'
        ).length;
        const percent3 = data.length > 0 ? (sampahBesar / data.length) * 100 : 0;
        updateCircle(circles[2], percent3);

        // Circle 4: Persentase sampah campuran
        const sampahCampuran = data.filter(f =>
            (f.properties.Jenis_Samp || '').toLowerCase() === 'campuran'
        ).length;
        const percent4 = data.length > 0 ? (sampahCampuran / data.length) * 100 : 0;
        updateCircle(circles[3], percent4);
    }
}

// Update single circle
function updateCircle(circle, percent) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percent / 100) * circumference;

    circle.setAttribute('data-percent', Math.round(percent));
    circle.style.strokeDasharray = circumference;

    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);
}

// Animate counter function untuk stats
function animateStatsCounter(element, start, end, duration) {
    if (!element) return;

    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = end;
        }
    };

    window.requestAnimationFrame(step);
}

// ============================================
// Table
// ============================================
function populateTable(data) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach((feature, index) => {
        const props = feature.properties;
        const row = document.createElement('tr');
        const lokasiPendek = (props.Lokasi || '-').length > 50
            ? (props.Lokasi || '-').substring(0, 50) + '...'
            : (props.Lokasi || '-');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${lokasiPendek}</td>
            <td>${props.Kecamatan || '-'}</td>
            <td><span class="badge badge-jenis">${props.Jenis_Samp || '-'}</span></td>
            <td><span class="badge badge-${(props['Volume___L'] || '').toLowerCase()}">${props['Volume___L'] || '-'}</span></td>
            <td>${props.Kondisi_Li || '-'}</td>
            <td>${props.Waktu_temp || '-'}</td>
            <td>
                <button class="btn-action btn-view" onclick="viewOnMap(${index})" title="Lihat di Peta">
                    <i class="fas fa-map-marker-alt"></i>
                </button>
                <button class="btn-action btn-info" onclick="showDetail(${index})" title="Detail">
                    <i class="fas fa-info-circle"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Update table info
    const displayedRows = document.getElementById('displayedRows');
    const totalRows = document.getElementById('totalRows');
    if (displayedRows) displayedRows.textContent = data.length;
    if (totalRows) totalRows.textContent = allMarkerData.length;
}

// View on map
function viewOnMap(index) {
    const marker = markers[index];
    if (marker) {
        const coords = marker.data.geometry.coordinates;
        map.setView([coords[1], coords[0]], 16);
        marker.marker.openPopup();

        // Switch to map view
        const mapContainer = document.getElementById('mapContainer');
        const tableContainer = document.getElementById('tableContainer');
        const toggleBtn = document.getElementById('toggleView');

        if (mapContainer) mapContainer.style.display = 'block';
        if (tableContainer) tableContainer.style.display = 'none';
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-table"></i> Lihat Tabel';

        // Scroll to map
        mapContainer?.scrollIntoView({ behavior: 'smooth' });
    }
}

// Show detail
function showDetail(index) {
    const data = allMarkerData[index];
    if (data) {
        const props = data.properties;
        const detailHTML = `
            <div style="text-align: left; max-width: 450px;">
                <h3 style="margin-bottom: 15px; color: #1a6b4a;"><i class="fas fa-info-circle"></i> Detail Lokasi Sampah</h3>
                <div style="line-height: 1.8;">
                    <p><strong>📍 Alamat Lengkap:</strong><br>${props.Lokasi || '-'}</p>
                    <p><strong>🏙️ Kecamatan:</strong> ${props.Kecamatan || '-'}</p>
                    <p><strong>♻️ Jenis Sampah:</strong> ${props.Jenis_Samp || '-'}</p>
                    <p><strong>📦 Volume:</strong> ${props['Volume___L'] || '-'}</p>
                    <p><strong>📏 Kondisi Lingkungan:</strong> ${props.Kondisi_Li || '-'}</p>
                    <p><strong>🕐 Waktu Pengamatan:</strong> ${props.Waktu_temp || '-'}</p>
                    <p><strong>🌍 Koordinat:</strong> ${data.geometry.coordinates[1].toFixed(6)}, ${data.geometry.coordinates[0].toFixed(6)}</p>
                </div>
            </div>
        `;
        showNotification(detailHTML, 'info');
    }
}

// ============================================
// Toggle View (Map/Table)
// ============================================
const toggleViewBtn = document.getElementById('toggleView');
if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', function () {
        const mapContainer = document.getElementById('mapContainer');
        const tableContainer = document.getElementById('tableContainer');

        if (mapContainer.style.display === 'none') {
            mapContainer.style.display = 'block';
            tableContainer.style.display = 'none';
            this.innerHTML = '<i class="fas fa-table"></i> Lihat Tabel';
        } else {
            mapContainer.style.display = 'none';
            tableContainer.style.display = 'block';
            this.innerHTML = '<i class="fas fa-map"></i> Lihat Peta';
        }
    });
}

// ============================================
// Search Table
// ============================================
const searchTable = document.getElementById('searchTable');
if (searchTable) {
    searchTable.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredData = allMarkerData.filter(feature => {
            const props = feature.properties;
            return (
                (props.Lokasi || '').toLowerCase().includes(searchTerm) ||
                (props.Kecamatan || '').toLowerCase().includes(searchTerm) ||
                (props.Jenis_Samp || '').toLowerCase().includes(searchTerm) ||
                (props.ID_data || '').toLowerCase().includes(searchTerm)
            );
        });

        populateTable(filteredData);
    });
}

// ============================================
// Export to CSV
// ============================================
const exportBtn = document.getElementById('exportData');
if (exportBtn) {
    exportBtn.addEventListener('click', function () {
        let csv = 'No,Lokasi,Kecamatan,Jenis Sampah,Volume,Kondisi Lingkungan,Waktu Pengamatan,Latitude,Longitude\n';

        allMarkerData.forEach((feature, index) => {
            const props = feature.properties;
            const coords = feature.geometry.coordinates;
            csv += `${index + 1},"${props.Lokasi || '-'}","${props.Kecamatan || '-'}","${props.Jenis_Samp || '-'}","${props['Volume___L'] || '-'}","${props.Kondisi_Li || '-'}","${props.Waktu_temp || '-'}",${coords[1]},${coords[0]}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-sampah-ilegal-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        showNotification('Data berhasil diexport!', 'success');
    });
}

// ============================================
// Event Listeners
// ============================================
const filterKecamatan = document.getElementById('filterKecamatan');
const filterJenis = document.getElementById('filterJenis');
const filterVolume = document.getElementById('filterVolume');
const resetBtn = document.getElementById('resetFilter');
const toggleTpsBtn = document.getElementById('toggleTps');

if (filterKecamatan) filterKecamatan.addEventListener('change', applyFilters);
if (filterJenis) filterJenis.addEventListener('change', applyFilters);
if (filterVolume) filterVolume.addEventListener('change', applyFilters);
if (resetBtn) resetBtn.addEventListener('click', resetFilters);
if (toggleTpsBtn) toggleTpsBtn.addEventListener('click', toggleTpsVisibility);

// ============================================
// Initialize on page load
// ============================================
if (document.getElementById('map')) {
    window.addEventListener('load', function () {
        initMap();
        console.log('✅ Map initialized successfully!');
    });
}

// ============================================
// TAMBAHAN: Load TPS Rekomendasi
// ============================================
async function loadTpsData() {
    try {
        const response = await fetch('data/tps_rekomendasi.geojson');
        const data = await response.json();

        allTpsData = data.features || [];

        console.log('✅ Loaded', allTpsData.length, 'TPS rekomendasi');

        // Render TPS markers
        renderTpsMarkers(allTpsData);

        // Update statistics with TPS data
        updateStatistics(allMarkerData, allTpsData);

    } catch (error) {
        console.error('Error loading TPS data:', error);
        showNotification('Gagal memuat data TPS rekomendasi', 'warning');
    }
}


// ============================================
// TAMBAHAN: Render TPS Markers
// ============================================
function renderTpsMarkers(features) {
    tpsLayer.clearLayers();
    tpsMarkers = [];

    features.forEach((feature, index) => {
        const coords = feature.geometry.coordinates;
        const lat = coords[1];
        const lon = coords[0];
        const props = feature.properties;

        // Icon khusus untuk TPS (biru dengan simbol tempat sampah)
        const tpsIcon = L.divIcon({
            className: 'custom-tps-marker',
            html: `<div class="tps-pin" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);">
                      <i class="fas fa-trash-restore" style="color: white;"></i>
                   </div>`,
            iconSize: [36, 48],
            iconAnchor: [18, 48],
            popupAnchor: [0, -48]
        });

        const marker = L.marker([lat, lon], { icon: tpsIcon }).addTo(tpsLayer);

        // Popup TPS yang informatif
        marker.bindPopup(`
            <div class="custom-popup tps-popup">
                <div class="popup-header" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white;">
                    <i class="fas fa-trash-restore"></i>
                    <h4>TPS Rekomendasi</h4>
                </div>
                <div class="popup-content">
                    <div class="popup-row">
                        <i class="fas fa-map-marker-alt"></i>
                        <span><strong>Cluster:</strong> ${props.cluster || index + 1}</span>
                    </div>
                    <div class="popup-row">
                        <i class="fas fa-map-marked-alt"></i>
                        <span><strong>Kecamatan:</strong> ${props.Kecamatan || '-'}</span>
                    </div>
                    <div class="popup-row">
                        <i class="fas fa-location-dot"></i>
                        <span><strong>Lokasi:</strong> ${props.Lokasi || '-'}</span>
                    </div>
                    <div class="popup-row">
                        <i class="fas fa-recycle"></i>
                        <span><strong>Jenis:</strong> ${props.Jenis_Sampah || '-'}</span>
                    </div>
                    <div class="popup-row">
                        <i class="fas fa-box"></i>
                        <span><strong>Volume:</strong> ${props.Volume || '-'}</span>
                    </div>
                    ${props.ID_data ? `<div class="popup-row"><i class="fas fa-hashtag"></i><span><strong>ID:</strong> ${props.ID_data}</span></div>` : ''}
                </div>
            </div>
        `);

        tpsMarkers.push({
            marker: marker,
            data: feature
        });
    });

    console.log('✅ Rendered', tpsMarkers.length, 'TPS markers');
}


// ============================================
// Update Filters - TAMBAH LOGIKA UNTUK TPS
// ============================================
function applyFilters() {
    const kecamatanFilter = document.getElementById('filterKecamatan')?.value || 'all';
    const jenisFilter = document.getElementById('filterJenis')?.value || 'all';
    const volumeFilter = document.getElementById('filterVolume')?.value || 'all';

    let filteredMarkerData = [...allMarkerData];
    let filteredTpsData = [...allTpsData];
    if (kecamatanFilter !== 'all') {
        filteredMarkerData = filteredMarkerData.filter(f =>
            f.properties.Kecamatan === kecamatanFilter
        );
        filteredTpsData = filteredTpsData.filter(f =>
            f.properties.Kecamatan === kecamatanFilter
        );
    }
    if (jenisFilter !== 'all') {
        filteredMarkerData = filteredMarkerData.filter(f =>
            f.properties.Jenis_Samp === jenisFilter
        );
    }
    if (volumeFilter !== 'all') {
        filteredMarkerData = filteredMarkerData.filter(f =>
            f.properties['Volume___L'] === volumeFilter
        );
        filteredTpsData = filteredTpsData.filter(f =>
            (f.properties.Volume || '').toLowerCase().includes(volumeFilter.toLowerCase())
        );
    }
    renderMarkers(filteredMarkerData);
    renderTpsMarkers(filteredTpsData);
    populateTable(filteredMarkerData);
    updateStatistics(filteredMarkerData, filteredTpsData);
    console.log('Filter applied:', filteredMarkerData.length, 'sampah +', filteredTpsData.length, 'TPS');
}


// ============================================
// Update Statistics - TAMBAH INFO TPS
// ============================================
function updateStatistics(data, tpsData = allTpsData) {
    const totalLokasi = document.getElementById('totalLokasi');
    if (totalLokasi) totalLokasi.textContent = data.length + tpsData.length;  // TOTAL SAMPAH + TPS

    const totalTps = document.getElementById('totalTps');
    if (totalTps) totalTps.textContent = tpsData.length;

    const kecamatans = new Set(data.map(f => f.properties.Kecamatan).filter(Boolean));
    const totalKecamatan = document.getElementById('totalKecamatan');
    if (totalKecamatan) totalKecamatan.textContent = kecamatans.size;

    // Jenis dan volume tetap dari sampah ilegal
    const jenisCount = {};
    data.forEach(f => {
        const jenis = f.properties.Jenis_Samp || 'Unknown';
        jenisCount[jenis] = (jenisCount[jenis] || 0) + 1;
    });
    const jenisTerbanyak = Object.keys(jenisCount).length > 0
        ? Object.keys(jenisCount).reduce((a, b) => jenisCount[a] > jenisCount[b] ? a : b)
        : 'N/A';
    const jenisTerbanyakEl = document.getElementById('jenisTerbanyak');
    if (jenisTerbanyakEl) jenisTerbanyakEl.textContent = jenisTerbanyak;

    const volumeCount = {};
    data.forEach(f => {
        const volume = f.properties['Volume___L'] || 'Unknown';
        volumeCount[volume] = (volumeCount[volume] || 0) + 1;
    });
    const volumeTerbanyak = Object.keys(volumeCount).length > 0
        ? Object.keys(volumeCount).reduce((a, b) => volumeCount[a] > volumeCount[b] ? a : b)
        : 'N/A';
    const volumeTerbanyakEl = document.getElementById('volumeTerbanyak');
    if (volumeTerbanyakEl) volumeTerbanyakEl.textContent = volumeTerbanyak;

    updateStatsSection(data);

    console.log('Statistics updated - TPS count:', allTpsData.length);
}

// ============================================
// Toggle TPS Visibility
// ============================================
function toggleTpsVisibility() {
    tpsVisible = !tpsVisible;

    if (tpsVisible) {
        // Show TPS markers
        renderTpsMarkers(allTpsData);
        showNotification('TPS Rekomendasi ditampilkan', 'success');
    } else {
        // Hide TPS markers
        tpsLayer.clearLayers();
        tpsMarkers = [];
        showNotification('TPS Rekomendasi disembunyikan', 'info');
    }

    // Update button text/icon
    const toggleTpsBtn = document.getElementById('toggleTps');
    if (toggleTpsBtn) {
        if (tpsVisible) {
            toggleTpsBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Sembunyikan TPS';
        } else {
            toggleTpsBtn.innerHTML = '<i class="fas fa-eye"></i> Tampilkan TPS';
        }
    }
}
