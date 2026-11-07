// Utilidades de formato compartidas por las pantallas.

export const hora = (iso) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const fechaHora = (iso) =>
  new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

// Hace cuánto: "hace 3 min"
export function haceCuanto(iso, ahora = Date.now()) {
  const s = Math.max(0, Math.round((ahora - new Date(iso).getTime()) / 1000))
  if (s < 60) return `hace ${s} s`
  const m = Math.round(s / 60)
  if (m < 60) return `hace ${m} min`
  const h = Math.round(m / 60)
  return `hace ${h} h`
}

// Número de radicado legible: 119-20261107-0007
export function crearRadicado(consecutivo, fecha = new Date()) {
  const f = `${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}`
  return `119-${f}-${String(consecutivo).padStart(4, '0')}`
}

export const urlGoogleMaps = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`

export const nombreCompleto = (r) => `${r.nombres} ${r.apellidos}`.trim()
