import { useEffect, useMemo, useState } from 'react'
import MapaOperador from '../mapa/MapaOperador.jsx'
import Logo from '../components/Logo.jsx'
import ListaReportes from '../components/operador/ListaReportes.jsx'
import DetalleReporte from '../components/operador/DetalleReporte.jsx'
import Filtros from '../components/operador/Filtros.jsx'
import { useReportes } from '../estado/ReportesContext.jsx'
import { ESTADOS, COLOR_ESTADO, esFinal } from '../data/estados.js'
import './operador.css'

// Orden de la lista: primero lo que nadie ha atendido; dentro de cada estado, lo más reciente.
const PRIORIDAD = [ESTADOS.RECIBIDO, ESTADOS.VALIDADO, ESTADOS.DESPACHADO, ESTADOS.CERRADO, ESTADOS.DESCARTADO]

export default function Operador() {
  // TODO resuelto: el mapa ya no usa REPORTES_DEMO; lee los reportes del estado global.
  const { reportes, simularMasivos, borrarSimulados, borrarTodo, errorGuardado } = useReportes()
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [filtros, setFiltros] = useState({ grupo: '', estado: '' })
  const [agrupar, setAgrupar] = useState(false)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const [ahora, setAhora] = useState(Date.now())

  // Reloj para los "hace X min" de la lista.
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  const visibles = useMemo(() => {
    return reportes
      .filter((r) => !filtros.grupo || r.grupo === Number(filtros.grupo))
      .filter((r) => {
        if (!filtros.estado) return true
        if (filtros.estado === 'activos') return !esFinal(r.estado)
        return r.estado === filtros.estado
      })
      .sort((a, b) => PRIORIDAD.indexOf(a.estado) - PRIORIDAD.indexOf(b.estado) || b.creado.localeCompare(a.creado))
  }, [reportes, filtros])

  const seleccionado = reportes.find((r) => r.id === seleccionadoId) ?? null
  const conteo = (estado) => reportes.filter((r) => r.estado === estado).length
  const haySimulados = reportes.some((r) => r.simulado)

  const simular = () => {
    simularMasivos(50)
    setAgrupar(true)
    setFiltros({ grupo: '', estado: 'activos' })
  }

  return (
    <div className="operador">
      <header className="operador__barra">
        <Logo claro />
        <span className="operador__rol">Centro de despacho · Radio operador</span>
        <ul className="contadores" aria-label="Reportes por estado">
          {PRIORIDAD.map((e) => (
            <li key={e} style={{ '--c': COLOR_ESTADO[e] }}>
              <button
                type="button"
                className={filtros.estado === e ? 'es-activo' : ''}
                onClick={() => setFiltros((f) => ({ ...f, estado: f.estado === e ? '' : e }))}
              >
                <b>{conteo(e)}</b> {e}
              </button>
            </li>
          ))}
        </ul>
        <div className="operador__herramientas">
          <button type="button" className="boton boton--oscuro boton--sm" onClick={simular}>⚡ Simular 50 reportes</button>
          {haySimulados && (
            <button type="button" className="boton boton--fantasma-oscuro boton--sm" onClick={borrarSimulados}>Quitar simulados</button>
          )}
          {reportes.length > 0 && (
            confirmarBorrado ? (
              <button type="button" className="boton boton--rojo boton--sm" onClick={() => { borrarTodo(); setSeleccionadoId(null); setConfirmarBorrado(false) }} onBlur={() => setConfirmarBorrado(false)}>
                ¿Borrar todo? Confirmar
              </button>
            ) : (
              <button type="button" className="boton boton--fantasma-oscuro boton--sm" onClick={() => setConfirmarBorrado(true)}>Borrar todo</button>
            )
          )}
        </div>
      </header>

      {errorGuardado && <p className="operador__alerta">{errorGuardado}</p>}

      <div className="operador__cuerpo">
        <div className="operador__mapa">
          <MapaOperador
            reportes={visibles}
            seleccionadoId={seleccionadoId}
            onSeleccionar={setSeleccionadoId}
            agrupar={agrupar}
          />
        </div>

        <aside className="operador__panel">
          {seleccionado ? (
            <DetalleReporte reporte={seleccionado} onCerrar={() => setSeleccionadoId(null)} />
          ) : (
            <>
              <div className="operador__panel-cabecera">
                <h2>Reportes <span>{visibles.length}{visibles.length !== reportes.length ? ` de ${reportes.length}` : ''}</span></h2>
                <Filtros filtros={filtros} onCambiar={setFiltros} agrupar={agrupar} onAgrupar={setAgrupar} />
              </div>
              <ListaReportes reportes={visibles} seleccionadoId={seleccionadoId} onSeleccionar={setSeleccionadoId} ahora={ahora} />
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
