const galleryGrid = document.getElementById("galleryGrid");

// Lengkap dengan daftar file dari gambar yang diunggah
const images = [
    "IMG-20251114-WA0011.jpg",
    "IMG-20251114-WA0012.jpg",
    "IMG-20251114-WA0013.jpg",
    "IMG-20251114-WA0014.jpg",
    "IMG-20251114-WA0015.jpg",
    "IMG-20251114-WA0016.jpg",
    "IMG-20251114-WA0017.jpg",
    "IMG-20251114-WA0018.jpg",
    "IMG-20251114-WA0019.jpg",
    "IMG-20251114-WA0052.jpg",
    "IMG-20251114-WA0053.jpg",
    "IMG-20251114-WA0054.jpg",
    "IMG-20251114-WA0055.jpg",
    "IMG-20251114-WA0056.jpg",
    "IMG-20251114-WA0057.jpg",
    "IMG-20251114-WA0058.jpg",
    "IMG-20251114-WA0059.jpg",
    "IMG-20251114-WA0060.jpg",
    "IMG-20251114-WA0061.jpg",
    "stamp_20251031_175635.jpg",
    "stamp_20251031_180249.jpg",
    "stamp_20251031_180611.jpg",
    "stamp_20251101_152900.jpg",
    "stamp_20251101_153047.jpg",
    "stamp_20251101_153657.jpg",
    "stamp_20251101_154311.jpg",
    "stamp_20251101_154530.jpg",
    "stamp_20251101_154608.jpg",
    "stamp_20251101_154653.jpg",
    "stamp_20251101_154739.jpg",
    "stamp_20251101_155047.jpg",
    "stamp_20251101_155430.jpg",
    "stamp_20251101_160001.jpg",
    "stamp_20251101_160118.jpg",
    "stamp_20251101_160230.jpg",
    "stamp_20251101_160858.jpg",
    "stamp_20251101_161216.jpg",
    "stamp_20251101_161242.jpg",
    "stamp_20251101_161359.jpg",
    "stamp_20251101_162633.jpg",
    "stamp_20251101_163058.jpg",
    "stamp_20251101_163129.jpg",
    "stamp_20251105_151547.jpg",
    "stamp_20251105_151758.jpg",
    "stamp_20251105_151918.jpg",
    "stamp_20251105_152126.jpg",
    "stamp_20251105_152247.jpg",
    "stamp_20251105_153050.jpg",
    "stamp_20251105_153713.jpg",
    "stamp_20251105_153726.jpg",
    "stamp_20251105_154440.jpg",
    "stamp_20251105_154551.jpg",
    "stamp_20251105_155122.jpg",
    "stamp_20251105_155446.jpg",
    "stamp_20251105_155617.jpg",
    "stamp_20251105_160424.jpg",
    "stamp_20251108_155401.jpg",
    "stamp_20251108_155659.jpg",
    "stamp_20251108_155837.jpg",
    "stamp_20251108_160021.jpg",
    "stamp_20251108_160308.jpg",
    "stamp_20251108_160410.jpg",
    "stamp_20251108_160902.jpg",
    "stamp_20251108_160955.jpg",
    "stamp_20251108_161744.jpg",
    "stamp_20251108_162540.jpg",
    "stamp_20251108_162803.jpg",
    "stamp_20251108_163758.jpg",
    "stamp_20251108_164136.jpg",
    "stamp_20251108_165116.jpg"
];

// Kategori berdasarkan nama file
function getCategory(filename) {
    if (filename.includes('stamp_')) return 'dokumentasi';
    if (filename.includes('WA001')) return 'lokasi-sampah';
    if (filename.includes('WA005')) return 'pembersihan';
    return 'lainnya';
}

// Deskripsi berdasarkan nama file
function getDescription(filename) {
    if (filename.includes('stamp_')) {
        return 'Dokumentasi stempel lokasi sampah ilegal';
    }
    if (filename.includes('WA001')) {
        return 'Lokasi pembuangan sampah ilegal yang teridentifikasi';
    }
    if (filename.includes('WA005')) {
        return 'Proses pembersihan dan penanganan sampah';
    }
    return 'Dokumentasi kegiatan pemantauan sampah';
}

// Tanggal dari nama file
function getDateFromFilename(filename) {
    // Ekstrak tanggal dari nama file
    const match = filename.match(/(\d{8})/);
    if (match) {
        const dateStr = match[1];
        const year = dateStr.substring(0,4);
        const month = dateStr.substring(4,6);
        const day = dateStr.substring(6,8);
        return `${day}/${month}/${year}`;
    }
    return "N/A";
}

// Render otomatis dengan layout yang lebih baik
images.forEach((img, index) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.setAttribute("data-category", getCategory(img));
    
    item.innerHTML = `
        <div class="gallery-card">
            <div class="gallery-image">
                <img src="Dokumentasi/${img}" alt="${img}" loading="lazy">
                <div class="image-overlay">
                    <div class="overlay-content">
                        <h4>${getCategory(img).toUpperCase()}</h4>
                        <p>${getDescription(img)}</p>
                    </div>
                    <button class="view-btn" onclick="openImageModal('Dokumentasi/${img}', '${img}')">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            </div>
            <div class="gallery-info">
                <div class="gallery-description">
                    <h4>${img.replace('.jpg', '').replace('_', ' ')}</h4>
                    <p>${getDescription(img)}</p>
                </div>
                <div class="gallery-meta">
                    <div class="gallery-tags">
                        <span class="tag">${getCategory(img)}</span>
                        <span class="tag">foto-${index + 1}</span>
                    </div>
                    <div class="gallery-meta-right">
                        <div class="date-badge">
                            <i class="far fa-calendar"></i>
                            <span>${getDateFromFilename(img)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    galleryGrid.appendChild(item);
});

// Modal untuk melihat gambar secara detail
function openImageModal(src, alt) {
    const modal = document.createElement("div");
    modal.className = "image-modal";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeImageModal()">&times;</span>
            <img src="${src}" alt="${alt}" class="modal-image">
            <div class="modal-info">
                <h3>${alt}</h3>
                <p>${getDescription(alt)}</p>
                <div class="modal-meta">
                    <span><i class="fas fa-folder"></i> ${getCategory(alt)}</span>
                    <span><i class="far fa-calendar"></i> ${getDateFromFilename(alt)}</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
}

function closeImageModal() {
    const modal = document.querySelector(".image-modal");
    if (modal) {
        modal.remove();
        document.body.style.overflow = "auto";
    }
}

// Style untuk modal
const modalStyle = document.createElement("style");
modalStyle.textContent = `
    .image-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .modal-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
        background: white;
        border-radius: 10px;
        overflow: hidden;
        animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .close-modal {
        position: absolute;
        top: 15px;
        right: 20px;
        color: white;
        font-size: 30px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10;
        background: rgba(0,0,0,0.5);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
    }
    
    .close-modal:hover {
        background: rgba(0,0,0,0.8);
    }
    
    .modal-image {
        width: 100%;
        max-height: 70vh;
        object-fit: contain;
        display: block;
    }
    
    .modal-info {
        padding: 20px;
        background: white;
    }
    
    .modal-info h3 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 1.2rem;
    }
    
    .modal-info p {
        color: #666;
        margin: 0 0 15px 0;
        line-height: 1.5;
    }
    
    .modal-meta {
        display: flex;
        gap: 20px;
        color: #888;
        font-size: 0.9rem;
    }
    
    .modal-meta i {
        margin-right: 5px;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
        .modal-content {
            max-width: 95%;
        }
        
        .modal-image {
            max-height: 60vh;
        }
        
        .modal-info {
            padding: 15px;
        }
    }
`;

document.head.appendChild(modalStyle);

// Tambahkan event listener untuk menutup modal dengan ESC
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeImageModal();
    }
});

// Update statistik
function updateGalleryStats() {
    const totalPhotos = images.length;
    const categories = {
        'dokumentasi': 0,
        'lokasi-sampah': 0,
        'pembersihan': 0,
        'lainnya': 0
    };
    
    images.forEach(img => {
        const category = getCategory(img);
        categories[category] = (categories[category] || 0) + 1;
    });
    
    // Update elemen statistik jika ada
    const statsElement = document.getElementById('galleryStats');
    if (statsElement) {
        statsElement.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${totalPhotos}</div>
                    <div class="stat-label">Total Foto</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${categories['lokasi-sampah']}</div>
                    <div class="stat-label">Lokasi Sampah</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${categories['pembersihan']}</div>
                    <div class="stat-label">Pembersihan</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${categories['dokumentasi']}</div>
                    <div class="stat-label">Dokumentasi</div>
                </div>
            </div>
        `;
    }
}

// Inisialisasi statistik
updateGalleryStats();

// Filter gallery jika ada filter buttons
document.addEventListener("DOMContentLoaded", function() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener("click", function() {
                const filterValue = this.getAttribute("data-filter");
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active");
                
                // Filter items
                const galleryItems = document.querySelectorAll(".gallery-item");
                galleryItems.forEach(item => {
                    if (filterValue === "all" || item.getAttribute("data-category") === filterValue) {
                        item.style.display = "block";
                        setTimeout(() => {
                            item.style.opacity = "1";
                            item.style.transform = "scale(1)";
                        }, 10);
                    } else {
                        item.style.opacity = "0";
                        item.style.transform = "scale(0.8)";
                        setTimeout(() => {
                            item.style.display = "none";
                        }, 300);
                    }
                });
            });
        });
    }
});
