import { GRUPOS } from '../../data/grupos.js'
import { ESTADOS } from '../../data/estados.js'

// Filtros por grupo y estado (modo emergencia masiva).
export default function Filtros({ filtros, onCambiar, agrupar, onAgrupar }) {
  const set = (campo) => (e) => onCambiar({ ...filtros, [campo]: e.target.value })
  return (
    <div className="filtros">
      <select value={filtros.grupo} onChange={set('grupo')} aria-label="Filtrar por grupo">
        <option value="">Todos los grupos</option>
        {GRUPOS.map((g) => <option key={g.codigo} value={g.codigo}>{g.codigo} · {g.nombre}</option>)}
      </select>
      <select value={filtros.estado} onChange={set('estado')} aria-label="Filtrar por estado">
        <option value="">Todos los estados</option>
        <option value="activos">Activos (sin cerrar)</option>
        {Object.values(ESTADOS).map((e) => <option key={e} value={e}>{e}</option>)}
      </select>
      <label className="interruptor">
        <input type="checkbox" checked={agrupar} onChange={(e) => onAgrupar(e.target.checked)} />
        <span>Agrupar cercanos</span>
      </label>
    </div>
  )
}
