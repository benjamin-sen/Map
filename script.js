// Initialiser la carte centrée sur l'Atlantique
const map = L.map("map").setView([20, -30], 3);

// --- 1) Fond GEBCO gris ---
const gebcoGray = L.tileLayer(
  "https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_grayscale_basemap_NCEI/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 12,
    opacity: 0.9,
    attribution: "GEBCO & NOAA NCEI"
  }
).addTo(map);

// Fond alternatif clair
const cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; Carto'
  }
);

// --- 2) Groupe pour les traces ---
const tracesGroup = L.layerGroup().addTo(map);


// Petite fonction utilitaire pour ajouter une trace GPX
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

      // Adapter le zoom à la 1ère trace chargée
      if (tracesGroup.getLayers().length === 1) {
        map.fitBounds(gpx.getBounds());
      }

      // ---- Infos pour la popup ----
      const distanceKm = (gpx.get_distance() / 1000).toFixed(1); // m -> km

      const start = gpx.get_start_time();
      const end = gpx.get_end_time();

      const startStr = start
        ? start.toLocaleDateString("fr-CH")
        : "date inconnue";
      const endStr = end ? end.toLocaleDateString("fr-CH") : "date inconnue";

      const html = `
        <strong>${name}</strong><br>
        Distance : ${distanceKm} km<br>
        Du : ${startStr}<br>
        Au : ${endStr}
      `;

      // On lie la popup au groupe de la trace :
      // un clic sur n'importe quelle portion de la trace ouvrira la popup
      gpx.bindPopup(html);
    })
    .addTo(map);

  gpxLayer.name = name;
}

// --- 3) Ajouter tes deux fichiers GPX ---

// Bleu eigengrau (légèrement bleuté)
const BLUE = "#7593c7";

// Liste de tous les GPX
const gpxFiles = [
  "activity_20969223596.gpx",
  "activity_21024257057.gpx",
  "activity_21040882598.gpx",
  "activity_21140677371.gpx",
  "activity_21140677789.gpx",
  "activity_21189820883.gpx",
  "activity_21238517271.gpx",
  "activity_21276471908.gpx"
];

// Chargement manuel de tous les GPX
gpxFiles.forEach((file, index) => {
  addGpx(
    "data/" + file,
    BLUE,
    "Trace " + (index + 1)
  );
});

// --- 4) Contrôle des couches ---
const baseLayers = {
  "GEBCO gris (NOAA)": gebcoGray,
  "Fond clair (Carto)": cartoLight
};

const overlays = {
  "Traces bateau": tracesGroup
};

L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map);

