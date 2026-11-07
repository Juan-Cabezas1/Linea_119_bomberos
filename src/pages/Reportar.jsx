import { lazy, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import Modal from '../components/Modal.jsx'
import RecomendacionesFotos from '../components/RecomendacionesFotos.jsx'
import Campo, { Opciones } from '../components/reporte/Campo.jsx'
import SelectorGrupo from '../components/reporte/SelectorGrupo.jsx'
import SelectorFotos from '../components/reporte/SelectorFotos.jsx'
import Confirmacion from '../components/reporte/Confirmacion.jsx'
import { useReportes, useReporte } from '../estado/ReportesContext.jsx'
import { BARRIOS } from '../data/barrios.js'
import { colorDeGrupo } from '../data/grupos.js'
import { FORM_INICIAL, validarReporte } from '../utils/validacion.js'
import { comprimirImagen } from '../utils/fotos.js'
import './reportar.css'

const MiniMapa = lazy(() => import('../mapa/MiniMapa.jsx'))

// El ciudadano recuerda su último reporte para seguir viendo el estado si recarga.
const CLAVE_MI_REPORTE = 'linea119.miReporte'
const leerMiReporte = () => {
  try { return localStorage.getItem(CLAVE_MI_REPORTE) } catch { return null }
}

export default function Reportar() {
  const [miReporteId, setMiReporteId] = useState(leerMiReporte)
  const miReporte = useReporte(miReporteId)

  const nuevo = () => {
    try { localStorage.removeItem(CLAVE_MI_REPORTE) } catch { /* sin almacenamiento */ }
    setMiReporteId(null)
    window.scrollTo(0, 0)
  }

  const alEnviar = (id) => {
    try { localStorage.setItem(CLAVE_MI_REPORTE, id) } catch { /* sin almacenamiento */ }
    setMiReporteId(id)
    window.scrollTo(0, 0)
  }

  return (
    <div className="reportar">
      <header className="barra-simple">
        <div className="contenedor barra-simple__fila">
          <Logo />
          <a href="tel:119" className="boton boton--contorno boton--sm">✆ 119</a>
        </div>
      </header>

      <main className="contenedor contenedor--estrecho">
        {miReporte ? (
          <Confirmacion reporte={miReporte} onNuevo={nuevo} />
        ) : (
          <FormularioReporte onEnviado={alEnviar} />
        )}
      </main>
    </div>
  )
}

function FormularioReporte({ onEnviado }) {
  const { agregarReporte, errorGuardado } = useReportes()
  const [form, setForm] = useState(FORM_INICIAL)
  const [tocados, setTocados] = useState({})
  const [fotos, setFotos] = useState([])
  const [punto, setPunto] = useState(null) // punto exacto elegido en el mini mapa
  const [consejos, setConsejos] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const errores = useMemo(() => validarReporte(form), [form])
  const faltan = Object.keys(errores).length
  const valido = faltan === 0
  const barrio = BARRIOS.find((b) => b.nombre === form.barrio)

  // Formulario controlado: un solo manejador para todos los campos.
  const cambiar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }))
  const tocar = (campo) => setTocados((t) => ({ ...t, [campo]: true }))
  const err = (campo) => (tocados[campo] ? errores[campo] : undefined)

  // Props comunes de un input de texto.
  const texto = (campo, extra = {}) => ({
    id: campo,
    name: campo,
    value: form[campo],
    onChange: (e) => cambiar(campo, e.target.value),
    onBlur: () => tocar(campo),
    'aria-invalid': Boolean(err(campo)),
    'aria-describedby': err(campo) ? `${campo}-error` : undefined,
    ...extra,
  })

  // Marca todos los campos como tocados para mostrar sus errores y lleva al primero.
  const verFaltantes = () => {
    setTocados(Object.fromEntries(Object.keys(form).map((k) => [k, true])))
    setTimeout(() => document.querySelector('.campo--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  const enviar = async (e) => {
    e.preventDefault()
    if (!valido || enviando) return verFaltantes()
    setEnviando(true)
    // Las fotos se reducen para guardarlas en localStorage (no hay servidor).
    const fotosGuardadas = await Promise.all(fotos.map((f) => comprimirImagen(f.file).catch(() => null)))
    const { sexo, edad, consciente, respira, ...resto } = form
    const reporte = agregarReporte({
      ...resto,
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      edificio: form.edificioNoAplica ? '' : form.edificio.trim(),
      lat: punto?.lat ?? barrio.lat,
      lng: punto?.lng ?? barrio.lng,
      ubicacionExacta: Boolean(punto),
      fotos: fotosGuardadas.filter(Boolean),
      ...(form.grupo === 300 ? { paciente: { sexo, edad, consciente, respira } } : {}),
    })
    onEnviado(reporte.id)
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <div className="formulario__intro">
        <Link to="/" className="enlace-volver">← Inicio</Link>
        <h1>Reportar emergencia</h1>
        <p>Todos los campos con <span className="campo__obligatorio">*</span> son obligatorios. Son las mismas preguntas que te haría el radio operador por teléfono.</p>
      </div>

      {/* ─── Pregunta 1: ¿Cuál es su emergencia? ─── */}
      <fieldset className="seccion">
        <legend className="seccion__titulo"><span>1</span> ¿Cuál es tu emergencia?</legend>

        <Campo id="grupo" etiqueta="Tipo de emergencia" error={err('grupo')}>
          <SelectorGrupo valor={form.grupo} onCambiar={(g) => { cambiar('grupo', g); tocar('grupo') }} />
        </Campo>

        <Campo id="queVe" etiqueta="¿Qué ves?" ayuda="Ej.: sale humo negro del segundo piso y hay gente en la ventana." error={err('queVe')}>
          <textarea {...texto('queVe', { rows: 3, maxLength: 400 })} />
        </Campo>

        {form.grupo === 300 && (
          <div className="sub-seccion">
            <p className="sub-seccion__titulo">Sobre la persona afectada</p>
            <div className="fila">
              <Campo id="sexo" etiqueta="Sexo" error={err('sexo')} ancho="mitad">
                <Opciones nombre="sexo" valor={form.sexo} opciones={['Mujer', 'Hombre', 'No sé']} onCambiar={(v) => { cambiar('sexo', v); tocar('sexo') }} error={err('sexo')} />
              </Campo>
              <Campo id="edad" etiqueta="Edad aproximada" error={err('edad')} ancho="mitad">
                <input {...texto('edad', { inputMode: 'numeric', maxLength: 3, placeholder: 'Años' })} onChange={(e) => cambiar('edad', e.target.value.replace(/\D/g, ''))} />
              </Campo>
            </div>
            <div className="fila">
              <Campo id="consciente" etiqueta="¿Está consciente?" error={err('consciente')} ancho="mitad">
                <Opciones nombre="consciente" valor={form.consciente} opciones={['Sí', 'No', 'No sé']} onCambiar={(v) => { cambiar('consciente', v); tocar('consciente') }} error={err('consciente')} />
              </Campo>
              <Campo id="respira" etiqueta="¿Respira?" error={err('respira')} ancho="mitad">
                <Opciones nombre="respira" valor={form.respira} opciones={['Sí', 'No', 'No sé']} onCambiar={(v) => { cambiar('respira', v); tocar('respira') }} error={err('respira')} />
              </Campo>
            </div>
          </div>
        )}

        <div className="campo">
          <span className="campo__etiqueta">Fotos (hasta 3)</span>
          <SelectorFotos fotos={fotos} onCambiar={setFotos} onVerConsejos={() => setConsejos(true)} />
        </div>
      </fieldset>

      {/* ─── Pregunta 3: ¿Dónde es su emergencia? ─── */}
      <fieldset className="seccion">
        <legend className="seccion__titulo"><span>2</span> ¿Dónde es la emergencia?</legend>

        <div className="fila">
          <Campo id="barrio" etiqueta="Barrio" error={err('barrio')} ancho="mitad">
            <select {...texto('barrio')} onChange={(e) => { cambiar('barrio', e.target.value); setPunto(null) }}>
              <option value="">Elige el barrio…</option>
              {BARRIOS.map((b) => <option key={b.nombre} value={b.nombre}>{b.nombre}</option>)}
            </select>
          </Campo>
          <Campo id="direccion" etiqueta="Dirección" error={err('direccion')} ancho="mitad">
            <input {...texto('direccion', { placeholder: 'Calle 5 # 38-20', autoComplete: 'street-address' })} />
          </Campo>
        </div>

        <Campo id="referencia" etiqueta="Punto de referencia" error={err('referencia')}>
          <input {...texto('referencia', { placeholder: 'Frente al parque, al lado de la droguería…' })} />
        </Campo>

        <Campo id="edificio" etiqueta="Nombre del edificio o conjunto" error={err('edificio')}>
          <div className="con-casilla">
            <input {...texto('edificio', { disabled: form.edificioNoAplica, placeholder: form.edificioNoAplica ? 'No aplica' : 'Edificio Torres del Río' })} />
            <label className="casilla">
              <input
                type="checkbox"
                checked={form.edificioNoAplica}
                onChange={(e) => { cambiar('edificioNoAplica', e.target.checked); tocar('edificio') }}
              />
              No aplica
            </label>
          </div>
        </Campo>

        {barrio && (
          <div className="campo">
            <span className="campo__etiqueta">Punto exacto <small>(opcional)</small></span>
            <div className="minimapa">
              <Suspense fallback={<div className="minimapa__cargando">Cargando mapa…</div>}>
                <MiniMapa
                  centro={[barrio.lat, barrio.lng]}
                  punto={punto}
                  onElegir={(lat, lng) => setPunto({ lat, lng })}
                  color={colorDeGrupo(form.grupo)}
                />
              </Suspense>
            </div>
            <p className="campo__ayuda">
              {punto
                ? `Punto marcado (${punto.lat.toFixed(5)}, ${punto.lng.toFixed(5)}). Puedes arrastrarlo.`
                : `Toca el mapa donde está la emergencia. Si no, usamos el centro de ${barrio.nombre}.`}
            </p>
          </div>
        )}
      </fieldset>

      {/* ─── Preguntas 2 y 4: ¿De qué número llama? ¿Cuál es su nombre? ─── */}
      <fieldset className="seccion">
        <legend className="seccion__titulo"><span>3</span> ¿Quién reporta?</legend>
        <div className="fila">
          <Campo id="nombres" etiqueta="Nombres" error={err('nombres')} ancho="mitad">
            <input {...texto('nombres', { autoComplete: 'given-name' })} />
          </Campo>
          <Campo id="apellidos" etiqueta="Apellidos" error={err('apellidos')} ancho="mitad">
            <input {...texto('apellidos', { autoComplete: 'family-name' })} />
          </Campo>
        </div>
        <Campo id="telefono" etiqueta="Teléfono" ayuda="10 dígitos, solo números. Te llamaremos si necesitamos más datos." error={err('telefono')}>
          <input
            {...texto('telefono', { inputMode: 'numeric', autoComplete: 'tel', maxLength: 10, placeholder: '3001234567' })}
            onChange={(e) => cambiar('telefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
        </Campo>
      </fieldset>

      {errorGuardado && <p className="campo__error">{errorGuardado}</p>}

      <div className="envio">
        <p className="envio__estado" aria-live="polite">
          {valido ? '✓ Todo listo para enviar' : `Faltan ${faltan} ${faltan === 1 ? 'campo' : 'campos'} por completar · `}
          {!valido && (
            <button type="button" className="enlace" onClick={verFaltantes}>ver cuáles</button>
          )}
        </p>
        <button type="submit" className="boton boton--primario boton--xl" disabled={!valido || enviando}>
          {enviando ? 'Enviando…' : 'Enviar reporte'}
        </button>
      </div>

      <Modal abierto={consejos} onCerrar={() => setConsejos(false)} titulo="¿Cómo tomar buenas fotos?">
        <RecomendacionesFotos />
      </Modal>
    </form>
  )
}
