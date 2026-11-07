import { Link } from 'react-router-dom'

// Identidad de la Línea 119 (insignia propia, no es el escudo oficial).
export default function Logo({ claro = false }) {
  return (
    <Link to="/" className={`logo ${claro ? 'logo--claro' : ''}`} aria-label="Inicio · Línea 119 Bomberos Cali">
      <span className="logo__insignia" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="22" height="22">
          <path
            d="M16 3c1 4.5 6 7 6 13a6 6 0 0 1-12 0c0-2.6 1.2-4.4 2.6-5.8.2 1.8 1 3 2.2 3.6C14.2 10.3 14.6 6.6 16 3Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="logo__texto">
        <strong>Línea 119</strong>
        <small>Bomberos Cali</small>
      </span>
    </Link>
  )
}
