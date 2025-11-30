import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj.js';
import OSM from 'ol/source/OSM';
import { Vector as VectorSource } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Icon, Style } from 'ol/style.js';
import Overlay from 'ol/Overlay.js';

// ==== Inject Enhanced HTML Structure ====
document.body.innerHTML = `
  <div class="container">
    <div class="header">
      <h1>🗺️ Peta Titik Sampah Illegal</h1>
      <p>Monitoring Lokasi Sampah Illegal di Provinsi Riau</p>
    </div>

    <div class="map-wrapper">
      <div id="map"></div>
      
      <div id="popup" class="ol-popup">
        <div class="popup-header">
          <h3 id="popup-title">Informasi Lokasi</h3>
          <button id="popup-closer" class="ol-popup-closer">×</button>
        </div>
        <div id="popup-content" class="popup-content"></div>
      </div>

      <div class="legend">
        <h4>📍 Legenda</h4>
        <div class="legend-item">
          <img src="icon/trush.png" class="legend-icon" alt="Sampah" onerror="this.style.background='#dc3545'">
          <span>Titik Sampah Illegal</span>
        </div>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-value" id="total-points">0</div>
        <div class="stat-label">Total Titik</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="total-districts">0</div>
        <div class="stat-label">Kecamatan</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">Riau</div>
        <div class="stat-label">Provinsi</div>
      </div>
    </div>
  </div>
`;

// ==== Inject Enhanced CSS ====
const style = document.createElement('style');
style.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }

  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    text-align: center;
  }

  .header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  }

  .header p {
    font-size: 1.1em;
    opacity: 0.95;
  }

  .map-wrapper {
    position: relative;
    height: 600px;
    background: #f5f5f5;
  }

  #map {
    width: 100%;
    height: 100%;
  }

  .ol-popup {
    position: absolute;
    background-color: white;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.25);
    padding: 0;
    bottom: 12px;
    left: -50px;
    min-width: 320px;
    max-width: 400px;
    animation: popupAppear 0.3s ease-out;
  }

  @keyframes popupAppear {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .ol-popup:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid white;
  }

  .popup-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 15px 15px 0 0;
    position: relative;
  }

  .popup-header h3 {
    margin: 0;
    font-size: 1.4em;
    padding-right: 30px;
  }

  .ol-popup-closer {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(255,255,255,0.2);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-size: 20px;
    color: white;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ol-popup-closer:hover {
    background: rgba(255,255,255,0.3);
    transform: rotate(90deg);
  }

  .popup-content {
    padding: 20px;
  }

  .info-item {
    margin-bottom: 15px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #667eea;
    transition: all 0.3s;
  }

  .info-item:hover {
    background: #e9ecef;
    transform: translateX(5px);
  }

  .info-label {
    font-weight: bold;
    color: #667eea;
    font-size: 0.85em;
    text-transform: uppercase;
    margin-bottom: 5px;
    display: block;
  }

  .info-value {
    color: #333;
    font-size: 1.05em;
  }

  .legend {
    position: absolute;
    bottom: 30px;
    right: 30px;
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    z-index: 1000;
  }

  .legend h4 {
    margin: 0 0 15px 0;
    color: #667eea;
    font-size: 1.1em;
  }

  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .legend-icon {
    width: 30px;
    height: 30px;
    margin-right: 10px;
    border-radius: 5px;
  }

  .stats-bar {
    display: flex;
    justify-content: space-around;
    padding: 20px;
    background: #f8f9fa;
    border-top: 1px solid #dee2e6;
  }

  .stat-item {
    text-align: center;
    padding: 15px;
    background: white;
    border-radius: 10px;
    min-width: 150px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  .stat-value {
    font-size: 2em;
    font-weight: bold;
    color: #667eea;
  }

  .stat-label {
    color: #6c757d;
    margin-top: 5px;
    font-size: 0.9em;
  }

  @media (max-width: 768px) {
    .header h1 {
      font-size: 1.8em;
    }
    
    .map-wrapper {
      height: 400px;
    }

    .legend {
      bottom: 10px;
      right: 10px;
      padding: 15px;
    }

    .stats-bar {
      flex-direction: column;
      gap: 10px;
    }
  }
`;
document.head.appendChild(style);

// ==== Layer polygon Riau ====
const riau = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'data/polygon_riau.json'
  })
});

// ==== Layer titik sampah ====
const banjirSource = new VectorSource({
  format: new GeoJSON(),
  url: 'data/Titiksampah.json'
});

const banjir = new VectorLayer({
  source: banjirSource,
  style: new Style({
    image: new Icon({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'icon/trush.png',
      width: 32,
      height: 32
    })
  })
});

// ==== Update statistics when features load ====
banjirSource.on('featuresloadend', function() {
  const features = banjirSource.getFeatures();
  document.getElementById('total-points').textContent = features.length;
  
  const districts = new Set(features.map(f => f.get('Kecamatan')));
  document.getElementById('total-districts').textContent = districts.size;
});

// ==== Popup DOM ====
const container = document.getElementById('popup');
const content_element = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');
const title_element = document.getElementById('popup-title');

const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

// ==== Inisialisasi Map ====
const map = new Map({
  target: document.getElementById('map'),
  layers: [
    new TileLayer({ source: new OSM() }),
    riau,
    banjir
  ],
  overlays: [overlay],
  view: new View({
    center: fromLonLat([101.438309, 0.510440]),
    zoom: 8
  })
});

// ==== Event Click Popup ====
map.on('singleclick', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (!feature) {
    overlay.setPosition(undefined);
    return;
  }

  const coordinate = evt.coordinate;
  const kecamatan = feature.get('Kecamatan') || 'N/A';
  
  title_element.textContent = kecamatan;
  
  const content = `
    <div class="info-item">
      <span class="info-label">🗑️ Jenis Sampah</span>
      <span class="info-value">${feature.get('Jenis_Samp') || 'N/A'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">📊 Volume</span>
      <span class="info-value">${feature.get('Volume___L') || 'N/A'} Liter</span>
    </div>
    <div class="info-item">
      <span class="info-label">🏘️ Jarak ke Lingkungan</span>
      <span class="info-value">${feature.get('Kondisi_Li') || 'N/A'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">⏰ Waktu Temuan</span>
      <span class="info-value">${feature.get('Waktu_temp') || 'N/A'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">📍 Lokasi</span>
      <span class="info-value">${feature.get('Lokasi') || 'N/A'}</span>
    </div>
  `;

  content_element.innerHTML = content;
  overlay.setPosition(coordinate);
});

// ==== Tombol Close Popup ====
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};