import { ESTADOS, FLUJO, COLOR_ESTADO } from '../data/estados.js'
import { hora } from '../utils/formato.js'

// Muestra en qué paso del flujo va el reporte, con la hora de cada cambio.
export default function LineaTiempo({ reporte }) {
  const horaDe = (estado) => reporte.historial.find((h) => h.estado === estado)?.hora
  const descartado = reporte.estado === ESTADOS.DESCARTADO
  const pasos = descartado ? [ESTADOS.RECIBIDO, ESTADOS.DESCARTADO] : FLUJO
  const actual = pasos.indexOf(reporte.estado)

  return (
    <ol className="linea-tiempo">
      {pasos.map((estado, i) => {
        const hecho = i <= actual
        const t = horaDe(estado)
        return (
          <li
            key={estado}
            className={`linea-tiempo__paso ${hecho ? 'es-hecho' : ''} ${i === actual ? 'es-actual' : ''}`}
            style={{ '--c': COLOR_ESTADO[estado] }}
          >
            <span className="linea-tiempo__punto" />
            <span className="linea-tiempo__nombre">
              {estado}
              {estado === ESTADOS.DESPACHADO && reporte.unidad && hecho ? ` · ${reporte.unidad}` : ''}
            </span>
            <span className="linea-tiempo__hora">{t ? hora(t) : '—'}</span>
          </li>
        )
      })}
    </ol>
  )
}
