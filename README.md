# Línea 119 · Bomberos Cali — Canal digital de reportes

Prototipo web (Parcial Final · Desarrollo Web 2026-2 · Universidad de San Buenaventura Cali) de un canal digital para que la ciudadanía reporte emergencias al Benemérito Cuerpo de Bomberos Voluntarios de Cali, y para que el radio operador las vea en un mapa real, las valide y despache unidades.

**Sitio desplegado:** _(pegar aquí el enlace de Vercel o Netlify)_

## Integrantes

| Nombre | Código | Parte principal |
| --- | --- | --- |
| _(nombre)_ | _(código)_ | _(p. ej. estado global y pantalla del operador)_ |
| _(nombre)_ | _(código)_ | _(p. ej. landing, escena 3D y formulario del ciudadano)_ |

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # versión de producción en /dist
```

Para probar el flujo completo:

1. Abre `http://localhost:5173/` y pulsa **Reportar emergencia**.
2. Llena el formulario y envíalo: verás el número de radicado y el estado.
3. Abre `http://localhost:5173/operador` **en otra pestaña** (o en la misma). El reporte aparece en la lista y en el mapa con un pin que pulsa.
4. Selecciónalo → **Llamar** → **Validado** → elige la unidad → **Despachar** → **Cerrar caso**.
5. Vuelve a la pestaña del ciudadano: el estado y la línea de tiempo cambian solos.

> El estado vive en `localStorage`. Para empezar de cero usa **Borrar todo** en el tablero del operador.

### Despliegue

- **Vercel:** importar el repositorio (framework Vite). `vercel.json` ya redirige todas las rutas a `index.html`.
- **Netlify:** build `npm run build`, carpeta `dist`. `public/_redirects` ya está incluido.

## Stack

React 18 + Vite · React Router 6 · react-leaflet 4 + OpenStreetMap · @react-three/fiber + @react-three/drei · CSS propio (sin framework). Sin backend.

## Estructura

```
src/
├─ App.jsx                      Rutas /, /reportar, /operador envueltas en el ReportesProvider
├─ estado/ReportesContext.jsx   Estado global: useReducer + Context + localStorage + evento storage
├─ data/
│  ├─ grupos.js                 7 grupos del protocolo con su color (único para todo el sitio)
│  ├─ barrios.js                19 barrios con coordenadas
│  ├─ estados.js                Estados, unidades, mensajes automáticos al ciudadano
│  └─ simulacion.js             Generador de 50 reportes ficticios (emergencia masiva)
├─ pages/                       Landing, Reportar, Operador (+ su CSS)
├─ components/
│  ├─ Logo, Insignias, LineaTiempo, Modal, RecomendacionesFotos   (compartidos)
│  ├─ reporte/   Campo, SelectorGrupo, SelectorFotos, Confirmacion
│  └─ operador/  ListaReportes, Filtros, DetalleReporte, AccionesReporte
├─ mapa/
│  ├─ MapaOperador.jsx          Mapa real con pines por estado, popup completo y agrupación
│  ├─ MiniMapa.jsx              Mapa de /reportar para marcar el punto exacto (useMapEvents)
│  ├─ iconos.js · mapa.css
├─ three/EscenaLanding.jsx      Camión de bomberos 3D
└─ utils/                       formato.js, validacion.js, fotos.js
```

### Estado global

`ReportesProvider` guarda la lista de reportes con `useReducer`. Las reglas del despacho están en el reducer, así que no dependen de la interfaz:

- solo un caso **Recibido** se puede validar o descartar;
- solo un caso **Validado** se puede despachar;
- solo un caso con **Unidad despachada** se puede cerrar.

Cada cambio queda en `historial` con su hora. Un `useEffect` guarda la lista en `localStorage` y otro escucha el evento `storage`, que sincroniza dos pestañas abiertas. Las pantallas usan el hook `useReportes()`.

### Código base: TODO resueltos

| TODO | Solución |
| --- | --- |
| Reemplazar `REPORTES_DEMO` | `Operador.jsx` lee `reportes` del Context (con filtros) y se los pasa a `MapaOperador` |
| `pin--pulso` / `pin--apagado` | `clasesPorEstado()` en `MapaOperador.jsx`; `.pin--apagado` (gris, 50 %) en `mapa.css` |
| Popup completo | Grupo, radicado, nombre, qué ve, dirección, estado (y unidad) y enlace a Google Maps |

### Escena 3D (React Three Fiber)

Camión de bomberos hecho solo con geometrías básicas (`boxGeometry`, `cylinderGeometry`, `RoundedBox` de drei). No usa modelos externos.

- **useFrame:** las ruedas giran, las líneas de la carretera avanzan, el chasis rebota, la barra de luces destella y la escalera se mueve suavemente con `MathUtils.damp`.
- **Mouse:** `onPointerOver` levanta la escalera y aclara la carrocería; `onClick` enciende o apaga la sirena (destellos, luz puntual, más velocidad y rebote).
- Luces ambiental, hemisférica y direccional con sombras; `ContactShadows` y `OrbitControls` limitados (sin zoom).
- Se carga con `React.lazy`, así el botón «Reportar emergencia» aparece de inmediato.

### Extras implementados

- Ventana flotante con recomendaciones para tomar las fotos.
- «Solicitar más información»: el operador escribe una pregunta, el ciudadano la ve como aviso en su pantalla y puede responder.
- Modo emergencia masiva: «Simular 50 reportes», filtros por grupo y estado, contadores por estado y agrupación de reportes cercanos según el zoom.
- Preguntas de continuación del grupo 300: sexo, edad, ¿consciente? y ¿respira?
- Mini mapa en `/reportar` para tocar o arrastrar el punto exacto (`useMapEvents`).
- Sincronización de pestañas con el evento `storage`.

## Respuestas a las 5 preguntas de Bomberos

**1. ¿Puede llegarle al radio operador un mapa con la ubicación exacta a partir de las coordenadas del ciudadano?**
*Qué se hizo:* cada reporte llega con coordenadas: el centro del barrio elegido o el punto exacto que el ciudadano toca en el mini mapa. El operador las ve como un pin del color del grupo en un mapa real de Cali, con enlace «Ver en Google Maps».
*Qué faltaría para producción:* tomar el GPS con la Geolocation API (requiere permiso y HTTPS), geocodificar la dirección escrita y conectarse con el sistema de despacho que ya usa Bomberos.

**2. ¿Puede el ciudadano recibir una respuesta automática para saber que su reporte fue recibido?**
*Qué se hizo:* al enviar, el ciudadano ve una pantalla con número de radicado, hora, estado, un mensaje para cada estado y una línea de tiempo. Todo se actualiza cuando el operador valida, despacha o cierra el caso.
*Qué faltaría:* un backend con base de datos y tiempo real (WebSockets o Firebase), además de notificaciones push, SMS o WhatsApp para quien cierre la página.

**3. ¿Qué pasa si hay una emergencia de gran magnitud y llegan reportes masivos?**
*Qué se hizo:* «Simular 50 reportes» genera una situación así (la mitad concentrada en un barrio). El tablero ordena primero lo no atendido, filtra por grupo y estado, muestra contadores, agrupa reportes cercanos en el mapa y permite descartar duplicados.
*Qué faltaría:* detección automática de duplicados por cercanía y tiempo, colas de prioridad, varios operadores con asignación de casos y un servidor que escale.

**4. ¿Puede el radio operador, si lo decide, hacer una videollamada al ciudadano?**
*Qué se hizo:* el botón «Llamar» abre una llamada telefónica (`tel:`) al número del ciudadano. La videollamada quedó fuera del alcance, como lo indica el enunciado.
*Qué faltaría:* WebRTC (o un servicio como Twilio, Daily o Jitsi) para abrir una videollamada desde el navegador con un enlace que el ciudadano recibe en su pantalla de seguimiento, usando el mismo mecanismo que hoy tiene «Solicitar más información».

**5. ¿Se pueden enviar varias fotos o videos, con recomendaciones de cómo tomarlos?**
*Qué se hizo:* hasta 3 fotos con miniatura (`URL.createObjectURL`) y una ventana flotante con recomendaciones. Al enviar, las fotos se reducen y se guardan para que el operador las vea y las amplíe.
*Qué faltaría:* almacenamiento en la nube (S3, Firebase Storage), soporte para video con compresión y límites de tamaño, y revisión de privacidad de las imágenes.

## Pregunta de diseño: ¿qué preguntas del protocolo se pueden omitir con una foto, video o videollamada?

1. **«¿Qué ve?» y la clasificación del grupo:** una foto de la escena muestra el tipo de emergencia (humo, vehículo, inundación). El operador confirma o corrige el grupo al validar, sin interrogar.
2. **La magnitud:** cuántos pisos, cuántos vehículos, color y cantidad de humo, si hay llamas visibles. Esto define qué unidad y cuántas se despachan.
3. **«¿Dónde es?» (punto de referencia y edificio):** la foto general muestra fachadas, avisos y placas, y junto con las coordenadas evita el tiempo que hoy se gasta ubicando el sitio.
4. **Preguntas del grupo 300 (¿consciente? ¿respira?):** en una videollamada el operador ve directamente al paciente.

Se mantienen siempre el **teléfono** (para devolver la llamada) y el **nombre**, porque una imagen no los reemplaza.

## Datos de prueba

Todos los nombres y teléfonos son ficticios (los simulados usan el patrón `300 000 0XXX`). El mapa usa OpenStreetMap y CARTO, con su atribución.
