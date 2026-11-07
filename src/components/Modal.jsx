import { useEffect } from 'react'

// Ventana flotante reutilizable (recomendaciones de fotos, ampliar una foto, etc.).
export default function Modal({ abierto, onCerrar, titulo, children, ancho = 520 }) {
  useEffect(() => {
    if (!abierto) return
    const tecla = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [abierto, onCerrar])

  if (!abierto) return null
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} onClick={onCerrar}>
      <div className="modal__caja" style={{ maxWidth: ancho }} onClick={(e) => e.stopPropagation()}>
        <header className="modal__cabecera">
          <h3>{titulo}</h3>
          <button type="button" className="boton-icono" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </header>
        <div className="modal__cuerpo">{children}</div>
      </div>
    </div>
  )
}
