// ===============================
// 1) Initialiser la carte
// ===============================
const map = L.map("map").setView([20, -30], 3);

// ===============================
// 2) Fonds de carte
// ===============================
const cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; Carto'
  }
).addTo(map);

const gebcoGray = L.tileLayer(
  "https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_grayscale_basemap_NCEI/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 12,
    opacity: 0.9,
    attribution: "GEBCO & NOAA NCEI"
  }
);

// ===============================
// 3) Groupe des traces
// ===============================
const tracesGroup = L.layerGroup().addTo(map);

// ===============================
// 4) Liste des GPX
// ===============================
const gpxFiles = [
  "activity_20969223596.gpx",
  "activity_21024257057.gpx",
  "activity_21040882598.gpx",
  "activity_21140677371.gpx",
  "activity_21140677789.gpx",
  "activity_8.gpx",
  "activity_21189820883.gpx",
  "activity_21238517271.gpx",
  "activity_21276471908.gpx"
];

let gpxLoadedCount = 0;
const totalGpx = gpxFiles.length;

// ===============================
// 5) Position actuelle
// ===============================
let lastPositionLatLng = null;
let currentPositionMarker = null;

// ===============================
// 6) Fonction d’ajout GPX
// ===============================
function addGpx(path, color, name) {
  const gpxLayer = new L.GPX(path, {
    async: true,
    marker_options: {
      startIconUrl: null,
      endIconUrl: null,
      shadowUrl: null
    },
    polyline_options: {
      color: color,
      weight: 3,
      opacity: 0.9
    }
  })
    .on("loaded", function (e) {
      const gpx = e.target;

      tracesGroup.addLayer(gpx);

      // ✅ POSITION DE FIN (méthode fiable)
      const endLatLng = gpx.get_end_location();
      if (endLatLng) {
        lastPositionLatLng = endLatLng;
      }

      gpxLoadedCount++;

      // Quand tous les GPX sont chargés
      if (gpxLoadedCount === totalGpx) {
        // Zoom global
        map.fitBounds(tracesGroup.getBounds(), {
          padding: [40, 40]
        });

        // 🔵 Point bleu position actuelle
        if (lastPositionLatLng) {
          currentPositionMarker = L.circleMarker(lastPositionLatLng, {
            radius: 6,
            color: "#1e90ff",
            fillColor: "#1e90ff",
            fillOpacity: 1
          }).addTo(map);
        }
      }

      // Popup
      const distanceKm = (gpx.get_distance() / 1000).toFixed(1);

      const start = gpx.get_start_time();
      const end = gpx.get_end_time();

      const html = `
        <strong>${name}</strong><br>
        Distance : ${distanceKm} km<br>
        Du : ${start ? start.toLocaleDateString("fr-CH") : "?"}<br>
        Au : ${end ? end.toLocaleDateString("fr-CH") : "?"}
      `;

      gpx.bindPopup(html);
    })
    .addTo(map);

  gpxLayer.name = name;
}

// ===============================
// 7) Charger les GPX
// ===============================
const BLUE = "#7593c7";

gpxFiles.forEach((file, index) => {
  addGpx("data/" + file, BLUE, "Trace " + (index + 1));
});

// ===============================
// 8) Contrôle des couches
// ===============================
const baseLayers = {
  "Fond clair (Carto)": cartoLight,
  "GEBCO gris (NOAA)": gebcoGray
};

const overlays = {
  "Traces bateau": tracesGroup
};

L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map);
