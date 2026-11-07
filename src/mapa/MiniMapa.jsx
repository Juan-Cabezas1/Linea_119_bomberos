import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { crearIcono } from './iconos.js'

// Extra: mini mapa en /reportar. El ciudadano toca el punto exacto de la emergencia.
// Props: centro [lat,lng] (el barrio elegido), punto {lat,lng} | null, onElegir(lat,lng), color
export default function MiniMapa({ centro, punto, onElegir, color = '#dc2626' }) {
  return (
    <MapContainer center={centro} zoom={15} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recentrar centro={centro} />
      <AlTocar onElegir={onElegir} />
      {punto && (
        <Marker
          position={[punto.lat, punto.lng]}
          icon={crearIcono(color, { seleccionado: true, clases: 'pin--pulso' })}
          draggable
          eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); onElegir(p.lat, p.lng) } }}
        />
      )}
    </MapContainer>
  )
}

// useMapEvents: cada clic en el mapa marca el punto de la emergencia.
function AlTocar({ onElegir }) {
  useMapEvents({ click: (e) => onElegir(e.latlng.lat, e.latlng.lng) })
  return null
}

// Cuando el ciudadano cambia de barrio, el mini mapa se mueve a ese barrio.
function Recentrar({ centro }) {
  const map = useMap()
  useEffect(() => {
    map.setView(centro, 15)
  }, [centro[0], centro[1], map]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
