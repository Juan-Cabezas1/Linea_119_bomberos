import { GRUPOS, colorDeGrupo } from '../data/grupos.js'
import { COLOR_ESTADO } from '../data/estados.js'

export const grupoPorCodigo = (codigo) => GRUPOS.find((g) => g.codigo === codigo)

// Código + nombre del grupo con su color (el mismo del mapa).
export function GrupoBadge({ codigo, corto = false }) {
  const g = grupoPorCodigo(codigo)
  return (
    <span className="insignia insignia--grupo" style={{ '--c': colorDeGrupo(codigo) }}>
      <b>{codigo}</b>
      {!corto && <span>{g?.nombre ?? 'Sin grupo'}</span>}
    </span>
  )
}

export function EstadoBadge({ estado, grande = false }) {
  return (
    <span className={`insignia insignia--estado ${grande ? 'insignia--grande' : ''}`} style={{ '--c': COLOR_ESTADO[estado] }}>
      <i aria-hidden="true" />
      {estado}
    </span>
  )
}
