// Validación del formulario del ciudadano (interrogatorio inicial del protocolo).
// Devuelve { campo: 'mensaje de error' } solo con los campos que tienen error.

export const FORM_INICIAL = {
  nombres: '',
  apellidos: '',
  telefono: '',
  grupo: null,
  queVe: '',
  direccion: '',
  barrio: '',
  referencia: '',
  edificio: '',
  edificioNoAplica: false,
  // Preguntas de continuación del grupo 300 (extra)
  sexo: '',
  edad: '',
  consciente: '',
  respira: '',
}

const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/

export function validarReporte(f) {
  const e = {}
  const vacio = (v) => !String(v ?? '').trim()

  // 4. ¿Cuál es su nombre?
  if (vacio(f.nombres)) e.nombres = 'Escribe tus nombres.'
  else if (!SOLO_LETRAS.test(f.nombres)) e.nombres = 'Usa solo letras.'
  if (vacio(f.apellidos)) e.apellidos = 'Escribe tus apellidos.'
  else if (!SOLO_LETRAS.test(f.apellidos)) e.apellidos = 'Usa solo letras.'

  // 2. ¿De qué número me llama?
  if (vacio(f.telefono)) e.telefono = 'Escribe tu teléfono.'
  else if (!/^\d{10}$/.test(f.telefono)) e.telefono = `Debe tener 10 dígitos (llevas ${f.telefono.length}).`

  // 1. ¿Cuál es su emergencia?
  if (!f.grupo) e.grupo = 'Elige el tipo de emergencia.'
  if (vacio(f.queVe)) e.queVe = 'Cuéntanos qué está pasando.'
  else if (f.queVe.trim().length < 10) e.queVe = 'Describe un poco más (mínimo 10 caracteres).'

  // 3. ¿Dónde es su emergencia?
  if (vacio(f.direccion)) e.direccion = 'Escribe la dirección.'
  if (vacio(f.barrio)) e.barrio = 'Elige el barrio.'
  if (vacio(f.referencia)) e.referencia = 'Escribe un punto de referencia (tienda, parque, iglesia…).'
  if (!f.edificioNoAplica && vacio(f.edificio)) e.edificio = 'Escribe el nombre del edificio o marca «No aplica».'

  // Grupo 300: preguntas de continuación del protocolo
  if (f.grupo === 300) {
    if (vacio(f.sexo)) e.sexo = 'Elige una opción.'
    if (vacio(f.edad)) e.edad = 'Escribe la edad aproximada.'
    else if (!/^\d{1,3}$/.test(f.edad) || Number(f.edad) > 120) e.edad = 'Edad entre 0 y 120.'
    if (vacio(f.consciente)) e.consciente = 'Elige una opción.'
    if (vacio(f.respira)) e.respira = 'Elige una opción.'
  }
  return e
}
