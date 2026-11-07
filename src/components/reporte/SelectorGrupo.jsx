import { GRUPOS } from '../../data/grupos.js'

// Pregunta 1 del protocolo: «¿Cuál es su emergencia?» → uno de los 7 grupos.
export default function SelectorGrupo({ valor, onCambiar, onBlur }) {
  return (
    <div className="selector-grupo" role="radiogroup" aria-label="Grupo de emergencia" onBlur={onBlur}>
      {GRUPOS.map((g) => (
        <label key={g.codigo} className={`selector-grupo__item ${valor === g.codigo ? 'es-activo' : ''}`} style={{ '--c': g.color }}>
          <input
            type="radio"
            name="grupo"
            value={g.codigo}
            checked={valor === g.codigo}
            onChange={() => onCambiar(g.codigo)}
          />
          <span className="selector-grupo__codigo">{g.codigo}</span>
          <span className="selector-grupo__nombre">{g.nombre}</span>
        </label>
      ))}
    </div>
  )
}
