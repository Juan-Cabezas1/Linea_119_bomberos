// Generador de reportes FICTICIOS para el modo "emergencia masiva".
// Nombres inventados y teléfonos con el patrón 300 000 0XXX (no son números reales).
import { BARRIOS } from './barrios.js'
import { GRUPOS } from './grupos.js'
import { ESTADOS, UNIDADES } from './estados.js'

const NOMBRES = ['Ana', 'Luis', 'Marta', 'Jorge', 'Paula', 'Andrés', 'Sofía', 'Camilo', 'Valeria', 'Julián', 'Lucía', 'Mateo']
const APELLIDOS = ['Prueba', 'Ficticio', 'Ejemplo', 'Demo', 'Simulado', 'Ensayo']
const DESCRIPCIONES = {
  100: ['Sale humo negro de una casa', 'Se incendia un carro en la vía', 'Fuego en un lote con pasto seco'],
  200: ['Se escuchó una explosión en un local', 'Se rompió un tanque de presión'],
  300: ['Choque entre moto y carro, hay un herido', 'Personas atrapadas en un ascensor', 'Una persona cayó al río'],
  400: ['Fuerte olor a gas en el edificio', 'Cable eléctrico caído sobre la acera'],
  500: ['Panal de abejas en un árbol del parque', 'Árbol a punto de caer sobre la casa'],
  800: ['La calle está inundada y entra agua a las casas', 'El viento tumbó un techo'],
  900: ['Animal atrapado en una alcantarilla', 'Situación extraña con humo blanco'],
}

const azar = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Reparto de estados para que el tablero se vea como un día real de mucho trabajo.
function estadoAzar() {
  const p = Math.random()
  if (p < 0.55) return ESTADOS.RECIBIDO
  if (p < 0.7) return ESTADOS.VALIDADO
  if (p < 0.82) return ESTADOS.DESPACHADO
  if (p < 0.92) return ESTADOS.CERRADO
  return ESTADOS.DESCARTADO
}

export function generarReportesSimulados(cantidad, consecutivoInicial, crearRadicado) {
  const ahora = Date.now()
  // Una "gran emergencia": la mitad de los reportes se concentra en un mismo barrio.
  const foco = azar(BARRIOS)
  return Array.from({ length: cantidad }, (_, i) => {
    const b = i % 2 === 0 ? foco : azar(BARRIOS)
    const grupo = i % 2 === 0 ? 100 : azar(GRUPOS).codigo
    const estado = estadoAzar()
    const creado = new Date(ahora - Math.random() * 40 * 60 * 1000).toISOString()
    const n = consecutivoInicial + i
    const historial = [{ estado: ESTADOS.RECIBIDO, hora: creado }]
    if (estado !== ESTADOS.RECIBIDO) historial.push({ estado, hora: new Date().toISOString(), nota: 'Simulación' })
    return {
      id: crearRadicado(n),
      n,
      creado,
      simulado: true,
      nombres: azar(NOMBRES),
      apellidos: azar(APELLIDOS),
      telefono: `3000000${String(100 + Math.floor(Math.random() * 900))}`,
      grupo,
      queVe: azar(DESCRIPCIONES[grupo]),
      direccion: `Calle ${1 + Math.floor(Math.random() * 80)} # ${1 + Math.floor(Math.random() * 60)}-${10 + Math.floor(Math.random() * 80)}`,
      barrio: b.nombre,
      lat: b.lat + (Math.random() - 0.5) * 0.008,
      lng: b.lng + (Math.random() - 0.5) * 0.008,
      referencia: 'Reporte simulado',
      edificio: '',
      edificioNoAplica: true,
      fotos: [],
      estado,
      unidad: estado === ESTADOS.DESPACHADO || estado === ESTADOS.CERRADO ? azar(UNIDADES) : null,
      historial,
      solicitudInfo: null,
    }
  })
}
