import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { ESTADOS } from '../data/estados.js'
import { crearRadicado } from '../utils/formato.js'
import { generarReportesSimulados } from '../data/simulacion.js'

// ─────────────────────────────────────────────────────────────
// ESTADO GLOBAL de la aplicación (sin backend).
// - La lista de reportes vive aquí y la comparten las 3 pantallas.
// - Se guarda en localStorage para sobrevivir recargas.
// - El evento "storage" sincroniza dos pestañas abiertas (ciudadano / operador).
// ─────────────────────────────────────────────────────────────

const CLAVE = 'linea119.reportes'
const ReportesContext = createContext(null)

function leerGuardados() {
  try {
    const crudo = localStorage.getItem(CLAVE)
    const lista = crudo ? JSON.parse(crudo) : []
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

const ahora = () => new Date().toISOString()

// Cambia el estado de un reporte y deja la huella en su historial.
function conCambio(reporte, estado, extra = {}, nota) {
  return {
    ...reporte,
    ...extra,
    estado,
    historial: [...reporte.historial, { estado, hora: ahora(), ...(nota ? { nota } : {}) }],
  }
}

function reducer(reportes, accion) {
  const editar = (fn) => reportes.map((r) => (r.id === accion.id ? fn(r) : r))

  switch (accion.tipo) {
    case 'reemplazar':
      return accion.reportes

    case 'agregar':
      return [accion.reporte, ...reportes]

    case 'agregarVarios':
      return [...accion.reportes, ...reportes]

    // Regla de negocio: solo se valida o descarta un caso que está Recibido.
    case 'validar':
      return editar((r) =>
        r.estado !== ESTADOS.RECIBIDO
          ? r
          : conCambio(
              r,
              ESTADOS.VALIDADO,
              { grupo: accion.grupo, grupoOriginal: r.grupo, solicitudInfo: null },
              accion.grupo !== r.grupo ? `Grupo corregido de ${r.grupo} a ${accion.grupo}` : undefined,
            ),
      )

    case 'descartar':
      return editar((r) =>
        r.estado !== ESTADOS.RECIBIDO ? r : conCambio(r, ESTADOS.DESCARTADO, { motivoDescarte: accion.motivo, solicitudInfo: null }, accion.motivo),
      )

    // Regla de negocio: NO se puede despachar sin validar.
    case 'despachar':
      return editar((r) =>
        r.estado !== ESTADOS.VALIDADO ? r : conCambio(r, ESTADOS.DESPACHADO, { unidad: accion.unidad }, accion.unidad),
      )

    case 'cerrar':
      return editar((r) => (r.estado !== ESTADOS.DESPACHADO ? r : conCambio(r, ESTADOS.CERRADO)))

    // Extra: el operador pide más información y el ciudadano la ve en su pantalla.
    case 'solicitarInfo':
      return editar((r) => ({ ...r, solicitudInfo: { mensaje: accion.mensaje, hora: ahora(), respuesta: null } }))

    case 'responderInfo':
      return editar((r) =>
        r.solicitudInfo ? { ...r, solicitudInfo: { ...r.solicitudInfo, respuesta: accion.texto, horaRespuesta: ahora() } } : r,
      )

    case 'borrarSimulados':
      return reportes.filter((r) => !r.simulado)

    case 'borrarTodo':
      return []

    default:
      return reportes
  }
}

export function ReportesProvider({ children }) {
  const [reportes, dispatch] = useReducer(reducer, undefined, leerGuardados)
  const [errorGuardado, setErrorGuardado] = useState(null)
  const vieneDeOtraPestana = useRef(false)

  // Guardar en localStorage cada vez que cambia la lista.
  useEffect(() => {
    if (vieneDeOtraPestana.current) {
      vieneDeOtraPestana.current = false
      return
    }
    try {
      localStorage.setItem(CLAVE, JSON.stringify(reportes))
      setErrorGuardado(null)
    } catch {
      setErrorGuardado('El almacenamiento del navegador está lleno: borra reportes antiguos o simulados.')
    }
  }, [reportes])

  // Extra: sincronizar pestañas. Si otra pestaña cambia los reportes, los recargamos aquí.
  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key !== CLAVE) return
      vieneDeOtraPestana.current = true
      dispatch({ tipo: 'reemplazar', reportes: leerGuardados() })
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  const siguienteConsecutivo = useCallback(
    () => reportes.reduce((max, r) => Math.max(max, r.n ?? 0), 0) + 1,
    [reportes],
  )

  // Crea el reporte con radicado, hora, estado inicial e historial.
  const agregarReporte = useCallback(
    (datos) => {
      const n = siguienteConsecutivo()
      const creado = ahora()
      const reporte = {
        ...datos,
        id: crearRadicado(n),
        n,
        creado,
        estado: ESTADOS.RECIBIDO,
        unidad: null,
        solicitudInfo: null,
        historial: [{ estado: ESTADOS.RECIBIDO, hora: creado }],
      }
      dispatch({ tipo: 'agregar', reporte })
      return reporte
    },
    [siguienteConsecutivo],
  )

  const acciones = useMemo(
    () => ({
      agregarReporte,
      validar: (id, grupo) => dispatch({ tipo: 'validar', id, grupo }),
      descartar: (id, motivo) => dispatch({ tipo: 'descartar', id, motivo }),
      despachar: (id, unidad) => dispatch({ tipo: 'despachar', id, unidad }),
      cerrar: (id) => dispatch({ tipo: 'cerrar', id }),
      solicitarInfo: (id, mensaje) => dispatch({ tipo: 'solicitarInfo', id, mensaje }),
      responderInfo: (id, texto) => dispatch({ tipo: 'responderInfo', id, texto }),
      simularMasivos: (cantidad = 50) =>
        dispatch({ tipo: 'agregarVarios', reportes: generarReportesSimulados(cantidad, siguienteConsecutivo(), crearRadicado) }),
      borrarSimulados: () => dispatch({ tipo: 'borrarSimulados' }),
      borrarTodo: () => dispatch({ tipo: 'borrarTodo' }),
    }),
    [agregarReporte, siguienteConsecutivo],
  )

  const valor = useMemo(() => ({ reportes, errorGuardado, ...acciones }), [reportes, errorGuardado, acciones])

  return <ReportesContext.Provider value={valor}>{children}</ReportesContext.Provider>
}

// Hook para usar el estado global desde cualquier componente.
export function useReportes() {
  const ctx = useContext(ReportesContext)
  if (!ctx) throw new Error('useReportes debe usarse dentro de <ReportesProvider>')
  return ctx
}

export function useReporte(id) {
  const { reportes } = useReportes()
  return reportes.find((r) => r.id === id) ?? null
}
