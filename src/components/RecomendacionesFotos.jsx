// Contenido de la ventana flotante "¿Cómo tomar las fotos?" (extra opcional).
const CONSEJOS = [
  ['Tu seguridad primero', 'Aléjate del fuego, del humo, del agua o del cable caído antes de tomar la foto. Nunca entres a un lugar en riesgo.'],
  ['Una foto general', 'Muestra la escena completa: el edificio, la vía o el lugar, para que el operador entienda el tamaño de la emergencia.'],
  ['Una foto de referencia', 'Incluye algo que identifique el sitio: la placa de la dirección, un aviso, una tienda o un edificio conocido.'],
  ['Un detalle', 'Si hay personas atrapadas, vehículos o el punto donde inicia el humo o la fuga, tómalo de cerca solo si es seguro.'],
  ['Foto horizontal y quieta', 'Sostén el celular con las dos manos, de lado, y no uses zoom digital: se pierde nitidez.'],
  ['De noche', 'No uses flash contra el humo (se ve blanco). Busca una luz de la calle detrás de ti.'],
]

export default function RecomendacionesFotos() {
  return (
    <ol className="consejos">
      {CONSEJOS.map(([t, d]) => (
        <li key={t}>
          <strong>{t}</strong>
          <p>{d}</p>
        </li>
      ))}
    </ol>
  )
}
