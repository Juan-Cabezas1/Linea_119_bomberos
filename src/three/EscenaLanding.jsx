import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls, RoundedBox } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────
// Escena 3D de la landing: un camión de bomberos hecho con geometrías básicas.
//  - useFrame: ruedas que giran, carretera que avanza, sirena que destella,
//    escalera que sube y el camión que "rebota" sobre la vía.
//  - Mouse: al pasar por encima (onPointerOver) se levanta la escalera;
//    al hacer clic (onClick) se enciende / apaga la sirena.
// ─────────────────────────────────────────────────────────────

const ROJO = '#c81e1e'
const ROJO_OSCURO = '#8f1515'
const METAL = '#cbd5e1'
const NEGRO = '#1f2937'

function Rueda({ position, girando }) {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.z -= delta * girando.current * 6
  })
  return (
    <group position={position} ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.26, 28]} />
        <meshStandardMaterial color={NEGRO} roughness={0.9} />
      </mesh>
      {/* Rin con radios para que se note el giro */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, position[2] > 0 ? 0.135 : -0.135]}>
        <cylinderGeometry args={[0.17, 0.17, 0.02, 6]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

// Barra de luces: dos destellos que alternan rojo / blanco.
function Sirena({ encendida }) {
  const izq = useRef()
  const der = useRef()
  const luz = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const fase = encendida ? Math.sin(t * 14) > 0 : false
    izq.current.emissiveIntensity = encendida ? (fase ? 3 : 0.15) : 0.2
    der.current.emissiveIntensity = encendida ? (fase ? 0.15 : 3) : 0.2
    luz.current.intensity = encendida ? 6 + Math.sin(t * 14) * 5 : 0
    luz.current.color.set(fase ? '#ff2a2a' : '#ffffff')
  })
  return (
    <group position={[-1.35, 1.38, 0]}>
      <mesh position={[0, 0, -0.22]}>
        <boxGeometry args={[0.22, 0.12, 0.36]} />
        <meshStandardMaterial ref={izq} color="#ff3b3b" emissive="#ff1a1a" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.22]}>
        <boxGeometry args={[0.22, 0.12, 0.36]} />
        <meshStandardMaterial ref={der} color="#ffffff" emissive="#ffffff" toneMapped={false} />
      </mesh>
      <pointLight ref={luz} position={[0, 0.4, 0]} distance={5} decay={2} />
    </group>
  )
}

// Escalera sobre el techo: sube con el mouse encima (interpolación en useFrame).
function Escalera({ levantada }) {
  const ref = useRef()
  useFrame((_, delta) => {
    const objetivo = levantada ? -0.55 : 0 // negativo = la punta delantera sube
    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, objetivo, 4, delta)
  })
  const peldanos = Array.from({ length: 9 }, (_, i) => -1.1 + i * 0.275)
  return (
    <group position={[1.25, 1.33, 0]}>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
        <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.35} />
      </mesh>
      <group ref={ref}>
        <group position={[-1.05, 0.08, 0]}>
          {[-0.2, 0.2].map((z) => (
            <mesh key={z} position={[0, 0, z]} castShadow>
              <boxGeometry args={[2.4, 0.06, 0.06]} />
              <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.35} />
            </mesh>
          ))}
          {peldanos.map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <boxGeometry args={[0.04, 0.04, 0.4]} />
              <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.35} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

function CamionBomberos({ sirena, onAlternarSirena }) {
  const grupo = useRef()
  const [encima, setEncima] = useState(false)
  // Velocidad de las ruedas en un ref para que useFrame la lea sin re-render.
  const velocidad = useRef(1)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    velocidad.current = THREE.MathUtils.damp(velocidad.current, sirena ? 2.4 : 1, 3, delta)
    // Rebote suave del chasis, más intenso con la sirena encendida
    grupo.current.position.y = 0.05 + Math.abs(Math.sin(t * (sirena ? 9 : 5))) * (sirena ? 0.035 : 0.015)
    grupo.current.rotation.z = Math.sin(t * 3) * 0.008
  })

  const ejes = [-1.35, 0.25, 1.15]

  return (
    <group
      ref={grupo}
      onPointerOver={(e) => { e.stopPropagation(); setEncima(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setEncima(false); document.body.style.cursor = '' }}
      onClick={(e) => { e.stopPropagation(); onAlternarSirena() }}
    >
      {/* Cabina */}
      <RoundedBox args={[1.05, 0.95, 1.1]} radius={0.08} position={[-1.35, 0.85, 0]} castShadow>
        <meshStandardMaterial color={encima ? '#e02626' : ROJO} roughness={0.45} />
      </RoundedBox>
      {/* Parabrisas y ventanas */}
      <mesh position={[-1.88, 0.98, 0]}>
        <boxGeometry args={[0.02, 0.38, 0.9]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.4} roughness={0.15} />
      </mesh>
      {[-0.56, 0.56].map((z) => (
        <mesh key={z} position={[-1.45, 1.0, z]}>
          <boxGeometry args={[0.55, 0.34, 0.02]} />
          <meshStandardMaterial color="#1e3a5f" metalness={0.4} roughness={0.15} />
        </mesh>
      ))}
      {/* Faros */}
      {[-0.36, 0.36].map((z) => (
        <mesh key={z} position={[-1.885, 0.55, z]}>
          <boxGeometry args={[0.03, 0.12, 0.18]} />
          <meshStandardMaterial color="#fff7cc" emissive="#fff3a3" emissiveIntensity={sirena ? 2 : 0.4} toneMapped={false} />
        </mesh>
      ))}
      {/* Defensa */}
      <mesh position={[-1.9, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.14, 1.12]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Carrocería trasera */}
      <RoundedBox args={[2.2, 1.0, 1.14]} radius={0.06} position={[0.3, 0.82, 0]} castShadow>
        <meshStandardMaterial color={encima ? '#e02626' : ROJO} roughness={0.45} />
      </RoundedBox>
      {/* Franja reflectiva y compartimentos */}
      {[-0.575, 0.575].map((z) => (
        <group key={z}>
          <mesh position={[0.3, 0.55, z]}>
            <boxGeometry args={[2.2, 0.08, 0.01]} />
            <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.25} />
          </mesh>
          {[-0.45, 0.3, 1.05].map((x) => (
            <mesh key={x} position={[x, 0.95, z]}>
              <boxGeometry args={[0.6, 0.42, 0.012]} />
              <meshStandardMaterial color={ROJO_OSCURO} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Chasis */}
      <mesh position={[-0.2, 0.33, 0]}>
        <boxGeometry args={[3.4, 0.16, 0.95]} />
        <meshStandardMaterial color={NEGRO} />
      </mesh>

      {ejes.map((x) =>
        [-0.5, 0.5].map((z) => <Rueda key={`${x}${z}`} position={[x, 0.32, z]} girando={velocidad} />),
      )}

      <Sirena encendida={sirena} />
      <Escalera levantada={encima} />
    </group>
  )
}

// Carretera con líneas que se desplazan para dar sensación de movimiento.
function Carretera({ sirena }) {
  const lineas = useRef()
  useFrame((_, delta) => {
    lineas.current.position.x += delta * (sirena ? 6 : 2.5)
    if (lineas.current.position.x > 1.2) lineas.current.position.x -= 1.2
  })
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 3.2]} />
        <meshStandardMaterial color="#2b2b2e" roughness={1} />
      </mesh>
      <group ref={lineas} position={[0, 0.005, 0]}>
        {Array.from({ length: 20 }, (_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-12 + i * 1.2, 0, 0.95]}>
            <planeGeometry args={[0.55, 0.06]} />
            <meshBasicMaterial color="#f5f5f4" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export default function EscenaLanding() {
  const [sirena, setSirena] = useState(false)
  return (
    <div className="escena3d">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [3.8, 2.2, 4.6], fov: 38 }}>
        <color attach="background" args={['#17110f']} />
        <fog attach="fog" args={['#17110f', 7, 16]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#ffd9c2', '#1b1b1f', 0.5]} />
        <directionalLight position={[4, 6, 3]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <group position={[0.2, -0.6, 0]}>
          <CamionBomberos sirena={sirena} onAlternarSirena={() => setSirena((s) => !s)} />
          <Carretera sirena={sirena} />
          <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={8} blur={2.4} far={2} />
        </group>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={!sirena}
          autoRotateSpeed={0.6}
        />
      </Canvas>
      <p className="escena3d__ayuda">
        {sirena ? '🚨 Sirena encendida · clic para apagarla' : 'Pasa el mouse sobre el camión · clic para encender la sirena'}
      </p>
    </div>
  )
}
