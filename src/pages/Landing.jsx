import { Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Logo from '../components/Logo.jsx'
import { GRUPOS } from '../data/grupos.js'
import './landing.css'

// La escena 3D se carga aparte para que el botón de reporte aparezca de inmediato.
const EscenaLanding = lazy(() => import('../three/EscenaLanding.jsx'))

const EJEMPLOS = {
  100: 'Edificación, vehículo, vegetación, basuras',
  200: 'Explosión, ruptura de equipos',
  300: 'Accidente de tránsito, personas en ascensor, caída en río',
  400: 'Fuga u olor a gas, línea eléctrica caída, HazMat',
  500: 'Solicitudes que no son emergencia inmediata',
  800: 'Inundación, vendaval, sismo',
  900: 'Lo que no encaja en los demás',
}

const PASOS = [
  ['01', 'Cuéntanos qué pasa', 'Elige el tipo de emergencia, el barrio y escribe qué ves. Toma menos de un minuto.'],
  ['02', 'Envía hasta 3 fotos', 'Una foto le ahorra al radio operador varias preguntas del protocolo.'],
  ['03', 'Sigue tu reporte', 'Recibes un número de radicado y ves cuando se valida y se despacha la unidad.'],
]

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing__barra contenedor">
        <Logo claro />
        <a className="landing__tel-mini" href="tel:119">Emergencias · <b>119</b></a>
      </header>

      <section className="hero contenedor">
        <div className="hero__texto">
          <p className="hero__pre">Benemérito Cuerpo de Bomberos Voluntarios de Cali</p>
          <h1 className="hero__titulo">
            ¿Tienes una <span>emergencia?</span>
          </h1>
          <p className="hero__bajada">
            Repórtala aquí con tu ubicación y fotos. Llega directo al radio operador de la Línea 119.
          </p>
          <div className="hero__acciones">
            <Link to="/reportar" className="boton boton--primario boton--xl">
              Reportar emergencia <span aria-hidden="true">→</span>
            </Link>
            <a href="tel:119" className="boton boton--contorno boton--xl">
              <span aria-hidden="true">✆</span> Llamar al 119
            </a>
          </div>
          <p className="hero__nota">Si hay personas en peligro inmediato, llama. El reporte web no reemplaza la línea.</p>
        </div>
        <div className="hero__escena">
          <Suspense fallback={<div className="escena3d escena3d--cargando">Cargando escena 3D…</div>}>
            <EscenaLanding />
          </Suspense>
        </div>
      </section>

      <section className="pasos contenedor" aria-label="Cómo funciona">
        {PASOS.map(([n, t, d]) => (
          <article key={n} className="paso">
            <span className="paso__n">{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </section>

      <section className="grupos contenedor" aria-labelledby="titulo-grupos">
        <div className="grupos__cabecera">
          <h2 id="titulo-grupos">Grupos de emergencia</h2>
          <p>Así clasifica Bomberos Cali cada llamada. Al reportar, elige el grupo que mejor describa lo que ves.</p>
        </div>
        <div className="grupos__rejilla">
          {GRUPOS.map((g) => (
            <article key={g.codigo} className="tarjeta-grupo" style={{ '--c': g.color }}>
              <span className="tarjeta-grupo__codigo">{g.codigo}</span>
              <h3>{g.nombre}</h3>
              <p>{EJEMPLOS[g.codigo]}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="pie">
        <div className="contenedor pie__fila">
          <div>
            <Logo claro />
            <p className="pie__legal">Prototipo académico · Desarrollo Web 2026-2 · Universidad de San Buenaventura Cali. Datos ficticios.</p>
          </div>
          <Link to="/operador" className="pie__operador">Acceso radio operador →</Link>
        </div>
      </footer>
    </div>
  )
}
