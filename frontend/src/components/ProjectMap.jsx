import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pin = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 35%, #F3E5AB, #D4AF37 55%, #C8102E);border:2px solid #F3E5AB;box-shadow:0 0 14px rgba(212,175,55,0.8);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function ProjectMap({ projects = [] }) {
  const pins = projects.filter((p) => p.lat && p.lng);
  if (!pins.length) return null;
  return (
    <MapContainer center={[30.662, 76.79]} zoom={11} scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", background: "#0A1322" }} data-testid="projects-map">
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ" />
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}" attribution="" />
      {pins.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={pin}>
          <Popup>
            <div style={{ minWidth: 170 }}>
              <strong style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 17 }}>{p.name}</strong>
              <div style={{ fontSize: 11, color: "#94A3B8", margin: "5px 0" }}>{p.locality}{p.locality && p.city ? ", " : ""}{p.city} · {p.price_label}</div>
              <a href={`/projects/${p.slug}`} style={{ color: "#E6C687", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em" }}>View Project →</a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
