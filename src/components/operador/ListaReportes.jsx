import { colorDeGrupo } from '../../data/grupos.js'
import { ESTADOS, esFinal } from '../../data/estados.js'
import { EstadoBadge } from '../Insignias.jsx'
import { hora, haceCuanto } from '../../utils/formato.js'

// Lista de reportes: color y código del grupo, hora, barrio y estado.
export default function ListaReportes({ reportes, seleccionadoId, onSeleccionar, ahora }) {
  if (!reportes.length) {
    return (
      <div className="lista-vacia">
        <p>No hay reportes con estos filtros.</p>
        <p className="texto-tenue">Abre <a href="/reportar" target="_blank" rel="noreferrer">/reportar</a> en otra pestaña y envía uno, o usa «Simular 50 reportes».</p>
      </div>
    )
  }
  return (
    <ul className="lista-reportes">
      {reportes.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            className={`item-reporte ${r.id === seleccionadoId ? 'es-seleccionado' : ''} ${esFinal(r.estado) ? 'es-final' : ''}`}
            style={{ '--c': colorDeGrupo(r.grupo) }}
            onClick={() => onSeleccionar(r.id)}
          >
            <span className="item-reporte__codigo">{r.grupo}</span>
            <span className="item-reporte__cuerpo">
              <span className="item-reporte__fila">
                <strong>{r.barrio}</strong>
                <span className="item-reporte__hora" title={haceCuanto(r.creado, ahora)}>{hora(r.creado)}</span>
              </span>
              <span className="item-reporte__que">{r.queVe}</span>
              <span className="item-reporte__fila">
                <EstadoBadge estado={r.estado} />
                <span className="item-reporte__iconos">
                  {r.fotos?.length > 0 && <span title="Trae fotos">📷 {r.fotos.length}</span>}
                  {r.solicitudInfo && !r.solicitudInfo.respuesta && <span title="Esperando información">⏳</span>}
                  {r.solicitudInfo?.respuesta && r.estado === ESTADOS.RECIBIDO && <span title="El ciudadano respondió">💬</span>}
                </span>
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
