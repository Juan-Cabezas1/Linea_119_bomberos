import { Routes, Route, Link } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Reportar from './pages/Reportar.jsx'
import Operador from './pages/Operador.jsx'
import { ReportesProvider } from './estado/ReportesContext.jsx'

// Las tres pantallas comparten el mismo estado global (ReportesProvider):
// lo que el ciudadano envía en /reportar aparece en el mapa de /operador,
// y lo que el operador cambia lo ve el ciudadano.
export default function App() {
  return (
    <ReportesProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/reportar" element={<Reportar />} />
        <Route path="/operador" element={<Operador />} />
        <Route
          path="*"
          element={
            <main className="contenedor" style={{ padding: '48px 16px' }}>
              <h1>Página no encontrada</h1>
              <Link to="/">Volver al inicio</Link>
            </main>
          }
        />
      </Routes>
    </ReportesProvider>
  )
}
