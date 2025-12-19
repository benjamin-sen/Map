// ===============================
// 1) Initialiser la carte
// ===============================
const map = L.map("map").setView([20, -30], 3);

// ===============================
// 2) Fonds de carte
// ===============================

// Fond principal : Carto Light
const cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; Carto'
  }
).addTo(map);

// Fond secondaire : GEBCO gris
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
// 5) Variables position actuelle
// ===============================
let lastGpxEndLatLng = null;
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

      // Ajouter la trace au groupe
      tracesGroup.addLayer(gpx);

      // 🔹 Récupérer le dernier point de la trace
      gpx.getLayers().forEach(layer => {
        if (layer instanceof L.Polyline) {
          const latlngs = layer.getLatLngs();
          if (latlngs.length > 0) {
            lastGpxEndLatLng = latlngs[latlngs.length - 1];
          }
        }
      });

      // Compteur de chargement
      gpxLoadedCount++;

      // Quand tous les GPX sont chargés
      if (gpxLoadedCount === totalGpx) {
        // Zoom global
        map.fitBounds(tracesGroup.getBounds(), {
          padding: [40, 40]
        });

        // 🔵 Placer le point bleu (position actuelle)
        if (lastGpxEndLatLng) {
          if (currentPositionMarker) {
            map.removeLayer(currentPositionMarker);
          }

          currentPositionMarker = L.circleMarker(lastGpxEndLatLng, {
            radius: 6,
            color: "#1e90ff",
            fillColor: "#1e90ff",
            fillOpacity: 1
          }).addTo(map);
        }
      }

      // Infos popup
      const distanceKm = (gpx.get_distance() / 1000).toFixed(1);

      const start = gpx.get_start_time();
      const end = gpx.get_end_time();

      const startStr = start
        ? start.toLocaleDateString("fr-CH")
        : "date inconnue";
      const endStr = end
        ? end.toLocaleDateString("fr-CH")
        : "date inconnue";

      const html = `
        <strong>${name}</strong><br>
        Distance : ${distanceKm} km<br>
        Du : ${startStr}<br>
        Au : ${endStr}
      `;

      gpx.bindPopup(html);
    })
    .addTo(map);

  gpxLayer.name = name;
}

// ===============================
// 7) Chargement des GPX
// ===============================
const BLUE = "#7593c7";

gpxFiles.forEach((file, index) => {
  addGpx(
    "data/" + file,
    BLUE,
    "Trace " + (index + 1)
  );
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
