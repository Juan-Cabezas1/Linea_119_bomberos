// Las fotos se previsualizan con URL.createObjectURL (no se suben a ningún servidor).
// Al enviar el reporte se reducen y se convierten a texto (data URL) para que
// quepan en localStorage y el operador las pueda ver aunque recargue la página.

export async function comprimirImagen(file, maxLado = 900, calidad = 0.7) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * escala)
    canvas.height = Math.round(img.height * escala)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', calidad)
  } finally {
    URL.revokeObjectURL(url)
  }
}
