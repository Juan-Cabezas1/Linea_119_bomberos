// Estados del reporte, en el orden del flujo de despacho.
// Recibido → Validado → Unidad despachada → Cerrado   (o Descartado)
export const ESTADOS = {
  RECIBIDO: 'Recibido',
  VALIDADO: 'Validado',
  DESPACHADO: 'Unidad despachada',
  CERRADO: 'Cerrado',
  DESCARTADO: 'Descartado',
}

// Orden lineal que se muestra en la línea de tiempo del ciudadano.
export const FLUJO = [ESTADOS.RECIBIDO, ESTADOS.VALIDADO, ESTADOS.DESPACHADO, ESTADOS.CERRADO]

export const COLOR_ESTADO = {
  [ESTADOS.RECIBIDO]: '#f59e0b',
  [ESTADOS.VALIDADO]: '#3b82f6',
  [ESTADOS.DESPACHADO]: '#ef4444',
  [ESTADOS.CERRADO]: '#22c55e',
  [ESTADOS.DESCARTADO]: '#6b7280',
}

// Mensaje que ve el ciudadano en su pantalla según el estado (respuesta automática).
export const MENSAJE_CIUDADANO = {
  [ESTADOS.RECIBIDO]: 'Recibimos tu reporte. Un radio operador lo está revisando. Mantén tu teléfono disponible: podemos llamarte.',
  [ESTADOS.VALIDADO]: 'Un radio operador confirmó tu emergencia y está asignando la unidad más cercana.',
  [ESTADOS.DESPACHADO]: 'Una unidad de Bomberos va en camino. Si es seguro, espera en un lugar visible.',
  [ESTADOS.CERRADO]: 'La atención de tu reporte terminó. Gracias por ayudarnos a llegar más rápido.',
  [ESTADOS.DESCARTADO]: 'Tu reporte fue descartado (duplicado o no corresponde a una emergencia). Si la emergencia continúa, llama al 119.',
}

export const UNIDADES = ['Máquina', 'Rescate', 'Ambulancia', 'HazMat']

export const MOTIVOS_DESCARTE = ['Falso', 'Duplicado']

export const esFinal = (estado) => estado === ESTADOS.CERRADO || estado === ESTADOS.DESCARTADO
