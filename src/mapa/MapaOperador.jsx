import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { crearIcono } from './iconos.js'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'
import { ESTADOS, COLOR_ESTADO, esFinal } from '../data/estados.js'
import { nombreCompleto, urlGoogleMaps } from '../utils/formato.js'

const CENTRO_CALI = [3.437, -76.522]

// TODO resuelto: la clase del pin depende del estado del reporte.
//  - Recibido → pin--pulso (llama la atención: nadie lo ha atendido)
//  - Cerrado / Descartado → pin--apagado (gris, ya no requiere acción)
export function clasesPorEstado(estado) {
  if (estado === ESTADOS.RECIBIDO) return 'pin--pulso'
  if (esFinal(estado)) return 'pin--apagado'
  return ''
}

// Mapa REAL de Cali (OpenStreetMap a través de Leaflet). No necesita API key.
// Props:
//   reportes: reportes del estado global (ya filtrados por el tablero)
//   seleccionadoId: id del reporte seleccionado (o null)
//   onSeleccionar: (id) => void
//   agrupar: agrupa reportes cercanos (modo emergencia masiva)
export default function MapaOperador({ reportes = [], seleccionadoId = null, onSeleccionar, agrupar = false }) {
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)

  return (
    <MapContainer center={CENTRO_CALI} zoom={13} style={{ width: '100%', height: '100%' }}>
      {/* Dos estilos de mapa: el operador los cambia con el control de la esquina */}
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Calles (OpenStreetMap)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Oscuro (centro de control)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {agrupar ? (
        <PinesAgrupados reportes={reportes} seleccionadoId={seleccionadoId} onSeleccionar={onSeleccionar} />
      ) : (
        reportes.map((r) => (
          <PinReporte key={r.id} r={r} seleccionado={r.id === seleccionadoId} onSeleccionar={onSeleccionar} />
        ))
      )}

      <IrAlSeleccionado reporte={seleccionado} />
      <Leyenda reportes={reportes} />
    </MapContainer>
  )
}

function PinReporte({ r, seleccionado, onSeleccionar }) {
  const icono = useMemo(
    () => crearIcono(colorDeGrupo(r.grupo), { seleccionado, clases: clasesPorEstado(r.estado) }),
    [r.grupo, r.estado, seleccionado],
  )
  return (
    <Marker
      position={[r.lat, r.lng]}
      icon={icono}
      zIndexOffset={seleccionado ? 1000 : esFinal(r.estado) ? -500 : 0}
      eventHandlers={{ click: () => onSeleccionar?.(r.id) }}
    >
      {/* TODO resuelto: popup con nombre, qué ve y estado */}
      <Popup>
        <div className="popup">
          <div className="popup__cabeza">
            <span className="popup__grupo" style={{ background: colorDeGrupo(r.grupo) }}>{r.grupo}</span>
            <span className="popup__radicado">{r.id}</span>
          </div>
          <strong className="popup__nombre">{nombreCompleto(r)}</strong>
          <p className="popup__que-ve">«{r.queVe}»</p>
          <p className="popup__lugar">{r.direccion} · {r.barrio}</p>
          <div className="popup__pie">
            <span className="popup__estado" style={{ '--c': COLOR_ESTADO[r.estado] }}>
              {r.estado}{r.unidad && r.estado === ESTADOS.DESPACHADO ? ` · ${r.unidad}` : ''}
            </span>
            <a href={urlGoogleMaps(r.lat, r.lng)} target="_blank" rel="noreferrer">Google Maps ↗</a>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

// Extra (emergencia masiva): agrupa los reportes que caen en la misma celda de una
// cuadrícula cuyo tamaño depende del zoom. Al hacer clic en un grupo, el mapa se acerca.
function PinesAgrupados({ reportes, seleccionadoId, onSeleccionar }) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })

  const grupos = useMemo(() => {
    const celda = 0.016 * 2 ** (13 - zoom)
    const celdas = new Map()
    for (const r of reportes) {
      const k = `${Math.floor(r.lat / celda)}:${Math.floor(r.lng / celda)}`
      if (!celdas.has(k)) celdas.set(k, [])
      celdas.get(k).push(r)
    }
    return [...celdas.values()]
  }, [reportes, zoom])

  return grupos.map((lista) => {
    if (lista.length === 1 || zoom >= 17) {
      return lista.map((r) => (
        <PinReporte key={r.id} r={r} seleccionado={r.id === seleccionadoId} onSeleccionar={onSeleccionar} />
      ))
    }
    const lat = lista.reduce((s, r) => s + r.lat, 0) / lista.length
    const lng = lista.reduce((s, r) => s + r.lng, 0) / lista.length
    const activos = lista.filter((r) => !esFinal(r.estado)).length
    // Color del grupo de emergencia que más se repite en la celda
    const conteo = {}
    lista.forEach((r) => (conteo[r.grupo] = (conteo[r.grupo] ?? 0) + 1))
    const dominante = Number(Object.entries(conteo).sort((a, b) => b[1] - a[1])[0][0])
    const tam = Math.min(58, 30 + lista.length * 1.6)
    const icono = L.divIcon({
      className: '',
      html: `<div class="cluster ${activos ? '' : 'cluster--apagado'}" style="--color:${colorDeGrupo(dominante)};width:${tam}px;height:${tam}px">${lista.length}</div>`,
      iconSize: [tam, tam],
      iconAnchor: [tam / 2, tam / 2],
    })
    return (
      <Marker
        key={lista.map((r) => r.id).join('|')}
        position={[lat, lng]}
        icon={icono}
        eventHandlers={{ click: () => map.flyTo([lat, lng], Math.min(zoom + 2, 18), { duration: 0.6 }) }}
      />
    )
  })
}

// Cuando se selecciona un reporte (desde la lista o el mapa), el mapa vuela hasta él
// y abre su popup.
function IrAlSeleccionado({ reporte }) {
  const map = useMap()
  const id = reporte?.id
  useEffect(() => {
    if (!reporte) return
    map.flyTo([reporte.lat, reporte.lng], Math.max(map.getZoom(), 16), { duration: 0.8 })
    const t = setTimeout(() => {
      map.eachLayer((capa) => {
        if (capa instanceof L.Marker && capa.getPopup?.()) {
          const p = capa.getLatLng()
          if (p.lat === reporte.lat && p.lng === reporte.lng) capa.openPopup()
        }
      })
    }, 850)
    return () => clearTimeout(t)
    // Solo cuando cambia el reporte seleccionado (no en cada cambio de estado).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, map])
  return null
}

// Leyenda fija en la esquina inferior izquierda: color y conteo por grupo.
function Leyenda({ reportes }) {
  const [abierta, setAbierta] = useState(true)
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leyenda">
        <button type="button" className="leyenda__titulo" onClick={() => setAbierta((a) => !a)}>
          REPORTES · {reportes.length} <span>{abierta ? '−' : '+'}</span>
        </button>
        {abierta &&
          GRUPOS.map((g) => {
            const n = reportes.filter((r) => r.grupo === g.codigo).length
            return (
              <div key={g.codigo} className="leyenda__fila" style={{ opacity: n ? 1 : 0.45 }}>
                <span className="leyenda__punto" style={{ background: g.color }} />
                <span style={{ width: 28, color: '#94a3b8' }}>{g.codigo}</span>
                <span style={{ flex: 1 }}>{g.nombre}</span>
                <strong>{n}</strong>
              </div>
            )
          })}
      </div>
    </div>
  )
}
