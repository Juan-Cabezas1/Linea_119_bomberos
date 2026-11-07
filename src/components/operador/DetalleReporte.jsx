import { useState } from 'react'
import { EstadoBadge, GrupoBadge } from '../Insignias.jsx'
import Modal from '../Modal.jsx'
import AccionesReporte from './AccionesReporte.jsx'
import { fechaHora, hora, nombreCompleto, urlGoogleMaps } from '../../utils/formato.js'
import { COLOR_ESTADO } from '../../data/estados.js'

// Detalle del reporte: datos del ciudadano y de la emergencia, fotos y acciones.
export default function DetalleReporte({ reporte, onCerrar }) {
  const [fotoGrande, setFotoGrande] = useState(null)
  const r = reporte

  return (
    <article className="detalle">
      <header className="detalle__cabecera">
        <button type="button" className="enlace-volver" onClick={onCerrar}>← Lista</button>
        <span className="detalle__radicado">{r.id}</span>
      </header>

      <div className="detalle__titulo">
        <GrupoBadge codigo={r.grupo} />
        <EstadoBadge estado={r.estado} grande />
      </div>
      <p className="detalle__que-ve">«{r.queVe}»</p>
      <p className="texto-tenue">Recibido {fechaHora(r.creado)}</p>

      {r.fotos?.length > 0 && (
        <div className="detalle__fotos">
          {r.fotos.map((src, i) => (
            <button key={i} type="button" onClick={() => setFotoGrande(src)} aria-label={`Ampliar foto ${i + 1}`}>
              <img src={src} alt={`Foto ${i + 1} enviada por el ciudadano`} />
            </button>
          ))}
        </div>
      )}

      <dl className="detalle__datos">
        <dt>Ciudadano</dt><dd>{nombreCompleto(r)}</dd>
        <dt>Teléfono</dt><dd>{r.telefono}</dd>
        <dt>Dirección</dt><dd>{r.direccion}</dd>
        <dt>Barrio</dt><dd>{r.barrio}</dd>
        <dt>Referencia</dt><dd>{r.referencia}</dd>
        <dt>Edificio</dt><dd>{r.edificioNoAplica || !r.edificio ? 'No aplica' : r.edificio}</dd>
        <dt>Coordenadas</dt>
        <dd>
          {r.lat.toFixed(5)}, {r.lng.toFixed(5)} {r.ubicacionExacta ? '· punto exacto' : '· centro del barrio'}
          <br />
          <a href={urlGoogleMaps(r.lat, r.lng)} target="_blank" rel="noreferrer">Ver en Google Maps ↗</a>
        </dd>
        {r.paciente && (
          <>
            <dt>Paciente</dt>
            <dd>{r.paciente.sexo}, {r.paciente.edad} años · Consciente: <b>{r.paciente.consciente}</b> · Respira: <b>{r.paciente.respira}</b></dd>
          </>
        )}
      </dl>

      {r.solicitudInfo && (
        <div className="detalle__info">
          <p><b>Pediste:</b> «{r.solicitudInfo.mensaje}» · {hora(r.solicitudInfo.hora)}</p>
          <p>{r.solicitudInfo.respuesta ? <><b>Respuesta:</b> «{r.solicitudInfo.respuesta}»</> : <span className="texto-tenue">Esperando respuesta del ciudadano…</span>}</p>
        </div>
      )}

      <AccionesReporte reporte={r} />

      <details className="detalle__historial">
        <summary>Historial ({r.historial.length})</summary>
        <ol>
          {r.historial.map((h, i) => (
            <li key={i} style={{ '--c': COLOR_ESTADO[h.estado] }}>
              <b>{h.estado}</b> · {hora(h.hora)}{h.nota ? ` · ${h.nota}` : ''}
            </li>
          ))}
        </ol>
      </details>

      <Modal abierto={Boolean(fotoGrande)} onCerrar={() => setFotoGrande(null)} titulo="Foto del ciudadano" ancho={900}>
        {fotoGrande && <img src={fotoGrande} alt="Foto ampliada" style={{ width: '100%', borderRadius: 8 }} />}
      </Modal>
    </article>
  )
}
