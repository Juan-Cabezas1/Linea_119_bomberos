import { useEffect, useRef, useState } from 'react'
import { useReportes } from '../../estado/ReportesContext.jsx'
import { EstadoBadge, GrupoBadge } from '../Insignias.jsx'
import LineaTiempo from '../LineaTiempo.jsx'
import { MENSAJE_CIUDADANO, COLOR_ESTADO } from '../../data/estados.js'
import { fechaHora, hora } from '../../utils/formato.js'

// Respuesta automática al ciudadano: radicado, hora y estado EN VIVO.
// Lee el reporte del estado global, así que cambia cuando el operador lo actualiza.
export default function Confirmacion({ reporte, onNuevo }) {
  const { responderInfo } = useReportes()
  const [respuesta, setRespuesta] = useState('')
  const [cambio, setCambio] = useState(false)
  const estadoPrevio = useRef(reporte.estado)

  // Pequeño destello cuando el operador cambia el estado.
  useEffect(() => {
    if (estadoPrevio.current !== reporte.estado) {
      estadoPrevio.current = reporte.estado
      setCambio(true)
      const t = setTimeout(() => setCambio(false), 1800)
      return () => clearTimeout(t)
    }
  }, [reporte.estado])

  const solicitud = reporte.solicitudInfo

  return (
    <section className="confirmacion" style={{ '--c': COLOR_ESTADO[reporte.estado] }} aria-live="polite">
      <div className={`confirmacion__tarjeta ${cambio ? 'es-actualizada' : ''}`}>
        <div className="confirmacion__check" aria-hidden="true">✓</div>
        <p className="confirmacion__pre">Reporte recibido</p>
        <h1 className="confirmacion__titulo">Tu número de radicado</h1>
        <p className="confirmacion__radicado" data-testid="radicado">{reporte.id}</p>
        <dl className="confirmacion__datos">
          <div><dt>Hora de envío</dt><dd>{fechaHora(reporte.creado)}</dd></div>
          <div><dt>Estado</dt><dd><EstadoBadge estado={reporte.estado} grande /></dd></div>
          <div><dt>Emergencia</dt><dd><GrupoBadge codigo={reporte.grupo} /></dd></div>
          <div><dt>Lugar</dt><dd>{reporte.direccion}, {reporte.barrio}</dd></div>
        </dl>
        <p className="confirmacion__mensaje" data-testid="mensaje-estado">{MENSAJE_CIUDADANO[reporte.estado]}</p>
      </div>

      {/* Extra: el operador pidió más información */}
      {solicitud && (
        <div className="aviso-info" role="alert">
          <p className="aviso-info__titulo">📣 El radio operador necesita más información · {hora(solicitud.hora)}</p>
          <p className="aviso-info__mensaje">«{solicitud.mensaje}»</p>
          {solicitud.respuesta ? (
            <p className="aviso-info__respuesta">Tu respuesta: «{solicitud.respuesta}» ✓ enviada</p>
          ) : (
            <form
              className="aviso-info__form"
              onSubmit={(e) => {
                e.preventDefault()
                if (respuesta.trim()) responderInfo(reporte.id, respuesta.trim())
              }}
            >
              <input
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Escribe tu respuesta…"
                aria-label="Respuesta al operador"
              />
              <button className="boton boton--primario" disabled={!respuesta.trim()}>Responder</button>
            </form>
          )}
          <p className="campo__ayuda">También pueden llamarte al {reporte.telefono}. Mantén el teléfono a la mano.</p>
        </div>
      )}

      <div className="confirmacion__seguimiento">
        <h2>Seguimiento</h2>
        <LineaTiempo reporte={reporte} />
      </div>

      <div className="confirmacion__acciones">
        <a href="tel:119" className="boton boton--contorno">✆ Llamar al 119</a>
        <button type="button" className="boton boton--fantasma" onClick={onNuevo}>Hacer otro reporte</button>
      </div>
    </section>
  )
}
