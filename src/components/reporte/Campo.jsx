// Envoltorio de un campo del formulario: etiqueta, ayuda y mensaje de error.
export default function Campo({ id, etiqueta, ayuda, error, children, ancho = 'completo' }) {
  return (
    <div className={`campo campo--${ancho} ${error ? 'campo--error' : ''}`}>
      <label htmlFor={id} className="campo__etiqueta">
        {etiqueta} <span className="campo__obligatorio" aria-hidden="true">*</span>
      </label>
      {children}
      {error ? (
        <p className="campo__error" id={`${id}-error`} role="alert">{error}</p>
      ) : (
        ayuda && <p className="campo__ayuda">{ayuda}</p>
      )}
    </div>
  )
}

// Grupo de botones de opción (Sí / No / No sé…), accesible como radio.
export function Opciones({ nombre, valor, opciones, onCambiar, error }) {
  return (
    <div className={`opciones ${error ? 'opciones--error' : ''}`} role="radiogroup" aria-label={nombre}>
      {opciones.map((o) => (
        <label key={o} className={`opcion ${valor === o ? 'es-activa' : ''}`}>
          <input type="radio" name={nombre} value={o} checked={valor === o} onChange={() => onCambiar(o)} />
          {o}
        </label>
      ))}
    </div>
  )
}
