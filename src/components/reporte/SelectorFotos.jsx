import { useEffect, useRef } from 'react'

export const MAX_FOTOS = 3

// Hasta 3 imágenes con miniatura. La vista previa usa URL.createObjectURL
// (la foto no sale del navegador). Cada foto: { file, url }.
export default function SelectorFotos({ fotos, onCambiar, onVerConsejos }) {
  const input = useRef()
  const fotosRef = useRef(fotos)
  fotosRef.current = fotos

  // Liberar las URLs temporales al salir de la pantalla.
  useEffect(() => () => fotosRef.current.forEach((f) => URL.revokeObjectURL(f.url)), [])

  const agregar = (e) => {
    const nuevas = [...e.target.files]
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, MAX_FOTOS - fotos.length)
      .map((file) => ({ file, url: URL.createObjectURL(file) }))
    onCambiar([...fotos, ...nuevas])
    e.target.value = '' // permite volver a elegir el mismo archivo
  }

  const quitar = (i) => {
    URL.revokeObjectURL(fotos[i].url)
    onCambiar(fotos.filter((_, j) => j !== i))
  }

  const lleno = fotos.length >= MAX_FOTOS

  return (
    <div className="fotos">
      <div className="fotos__rejilla">
        {fotos.map((f, i) => (
          <figure key={f.url} className="fotos__mini">
            <img src={f.url} alt={`Foto ${i + 1} de la emergencia`} />
            <button type="button" onClick={() => quitar(i)} aria-label={`Quitar foto ${i + 1}`}>✕</button>
          </figure>
        ))}
        {!lleno && (
          <button type="button" className="fotos__agregar" onClick={() => input.current.click()}>
            <span aria-hidden="true">＋</span>
            Agregar foto
            <small>{fotos.length}/{MAX_FOTOS}</small>
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/*"
        onChange={agregar}
        hidden
        aria-label="Elegir fotos"
        data-testid="input-fotos"
      />
      <p className="campo__ayuda">
        {lleno ? 'Llegaste al máximo de 3 fotos.' : 'Opcional, pero ayuda mucho.'}{' '}
        <button type="button" className="enlace" onClick={onVerConsejos}>¿Cómo tomar buenas fotos?</button>
      </p>
    </div>
  )
}
