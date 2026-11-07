import { useEffect, useState } from 'react'
import { useReportes } from '../../estado/ReportesContext.jsx'
import { GRUPOS } from '../../data/grupos.js'
import { ESTADOS, UNIDADES, MOTIVOS_DESCARTE } from '../../data/estados.js'

// Contactar → validar (o descartar) → despachar → cerrar.
// Regla clave: «Despachar» solo se activa si el caso está Validado.
export default function AccionesReporte({ reporte }) {
  const { validar, descartar, despachar, cerrar, solicitarInfo } = useReportes()
  const [grupo, setGrupo] = useState(reporte.grupo)
  const [unidad, setUnidad] = useState('')
  const [motivo, setMotivo] = useState(MOTIVOS_DESCARTE[0])
  const [mensaje, setMensaje] = useState('')

  // Al cambiar de reporte, reiniciar los controles.
  useEffect(() => {
    setGrupo(reporte.grupo)
    setUnidad(sugerirUnidad(reporte.grupo))
    setMensaje('')
  }, [reporte.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const { estado } = reporte
  const recibido = estado === ESTADOS.RECIBIDO
  const validado = estado === ESTADOS.VALIDADO

  return (
    <div className="acciones">
      {/* Paso 1: contactar */}
      <section className="acciones__paso">
        <h4><span>1</span> Contactar</h4>
        <a className="boton boton--verde boton--bloque" href={`tel:${reporte.telefono}`}>
          ✆ Llamar a {reporte.nombres} · {reporte.telefono}
        </a>
        {recibido && (
          <form
            className="acciones__fila"
            onSubmit={(e) => {
              e.preventDefault()
              if (mensaje.trim()) { solicitarInfo(reporte.id, mensaje.trim()); setMensaje('') }
            }}
          >
            <input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ej.: ¿Hay personas dentro?"
              aria-label="Mensaje para el ciudadano"
            />
            <button className="boton boton--oscuro" disabled={!mensaje.trim()}>Solicitar más información</button>
          </form>
        )}
      </section>

      {/* Paso 2: validar o descartar */}
      <section className={`acciones__paso ${!recibido ? 'es-hecho' : ''}`}>
        <h4><span>2</span> Validar</h4>
        {recibido ? (
          <>
            <label className="acciones__etiqueta" htmlFor="grupo-validar">Grupo (puedes corregirlo)</label>
            <div className="acciones__fila">
              <select id="grupo-validar" value={grupo} onChange={(e) => setGrupo(Number(e.target.value))}>
                {GRUPOS.map((g) => <option key={g.codigo} value={g.codigo}>{g.codigo} · {g.nombre}</option>)}
              </select>
              <button className="boton boton--azul" onClick={() => validar(reporte.id, grupo)}>✓ Validado</button>
            </div>
            <div className="acciones__fila">
              <select value={motivo} onChange={(e) => setMotivo(e.target.value)} aria-label="Motivo de descarte">
                {MOTIVOS_DESCARTE.map((m) => <option key={m}>{m}</option>)}
              </select>
              <button className="boton boton--gris" onClick={() => descartar(reporte.id, motivo)}>✕ Descartado</button>
            </div>
          </>
        ) : (
          <p className="acciones__hecho">
            {estado === ESTADOS.DESCARTADO ? `Descartado · ${reporte.motivoDescarte}` : 'Caso validado'}
            {reporte.grupoOriginal && reporte.grupoOriginal !== reporte.grupo && ` (grupo corregido ${reporte.grupoOriginal} → ${reporte.grupo})`}
          </p>
        )}
      </section>

      {/* Paso 3: despachar (bloqueado hasta validar) */}
      {estado !== ESTADOS.DESCARTADO && (
        <section className={`acciones__paso ${!validado && !recibido ? 'es-hecho' : ''}`}>
          <h4><span>3</span> Despachar</h4>
          {estado === ESTADOS.DESPACHADO || estado === ESTADOS.CERRADO ? (
            <p className="acciones__hecho">Unidad despachada: <b>{reporte.unidad}</b></p>
          ) : (
            <>
              <div className="unidades" role="radiogroup" aria-label="Unidad">
                {UNIDADES.map((u) => (
                  <label key={u} className={`unidad ${unidad === u ? 'es-activa' : ''} ${!validado ? 'es-bloqueada' : ''}`}>
                    <input type="radio" name="unidad" value={u} checked={unidad === u} disabled={!validado} onChange={() => setUnidad(u)} />
                    {u}
                  </label>
                ))}
              </div>
              <button
                className="boton boton--rojo boton--bloque"
                disabled={!validado || !unidad}
                onClick={() => despachar(reporte.id, unidad)}
                title={!validado ? 'Primero valida el caso' : undefined}
              >
                🚒 Despachar {unidad}
              </button>
              {!validado && <p className="acciones__bloqueo">🔒 Primero valida el caso para poder despachar.</p>}
            </>
          )}
        </section>
      )}

      {/* Paso 4: cerrar */}
      {(estado === ESTADOS.DESPACHADO || estado === ESTADOS.CERRADO) && (
        <section className="acciones__paso">
          <h4><span>4</span> Cerrar</h4>
          {estado === ESTADOS.DESPACHADO ? (
            <button className="boton boton--oscuro boton--bloque" onClick={() => cerrar(reporte.id)}>Cerrar caso</button>
          ) : (
            <p className="acciones__hecho">Caso cerrado.</p>
          )}
        </section>
      )}
    </div>
  )
}

// Unidad sugerida según el grupo (el operador la puede cambiar).
function sugerirUnidad(grupo) {
  if (grupo === 300) return 'Rescate'
  if (grupo === 400) return 'HazMat'
  return 'Máquina'
}
