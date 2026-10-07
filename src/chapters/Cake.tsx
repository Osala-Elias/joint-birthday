import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Group, PointLight } from 'three'
import confetti from 'canvas-confetti'
import gsap from 'gsap'
import { experience } from '../config/experience'

const THRESHOLD = 0.35 // how hard you must blow (0 to 1): lower = easier
const BLOW_SECONDS = 0.5 // how long you must keep blowing
const COLORS = ['#fde68a', '#f9a8d4', '#93c5fd', '#ffffff', '#fca5a5']

type Level = { current: number }
type Vec3 = [number, number, number]

function Flame({ position, lit, delay, level }: { position: Vec3; lit: boolean; delay: number; level: Level }) {
  const grp = useRef<Group>(null)
  const light = useRef<PointLight>(null)
  const size = useRef(0)
  const prevLit = useRef(false)
  const since = useRef(0)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (lit !== prevLit.current) {
      prevLit.current = lit
      since.current = t
    }
    const on = lit && t - since.current >= delay
    const lvl = level.current
    const speed = on ? 2.5 : 7
    size.current += ((on ? 1 : 0) - size.current) * Math.min(1, dt * speed)

    const flick = 1 + Math.sin(t * 18 + delay * 5) * 0.06 + Math.sin(t * 31) * 0.04 + lvl * 0.5 * Math.sin(t * 40)
    if (grp.current) {
      grp.current.scale.setScalar(Math.max(0.0001, size.current * flick))
      grp.current.rotation.z = lvl * Math.sin(t * 25) * 0.5
    }
    if (light.current) light.current.intensity = size.current * (5 + Math.sin(t * 20) * 0.8)
  })

  return (
    <group position={position}>
      <group ref={grp}>
        <mesh scale={[0.8, 1.7, 0.8]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ffd27a" toneMapped={false} />
        </mesh>
        <mesh scale={[0.9, 1.5, 0.9]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ff9a3c" transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <pointLight ref={light} color="#ffb25b" distance={5} decay={2} intensity={0} />
    </group>
  )
}

function Candle({ x, color }: { x: number; color: string }) {
  return (
    <group position={[x, 1.935, 0]}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.55, 20]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.07, 6]} />
        <meshStandardMaterial color="#2a2118" />
      </mesh>
    </group>
  )
}

function CakeModel({ lit, level }: { lit: boolean; level: Level }) {
  const berries = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        return [Math.cos(a) * 1.5, 1.02, Math.sin(a) * 1.5] as Vec3
      }),
    [],
  )
  const pearls = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3
        return [Math.cos(a) * 0.98, 1.7, Math.sin(a) * 0.98] as Vec3
      }),
    [],
  )

  return (
    <group>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.08, 48]} />
        <meshStandardMaterial color="#d9c9a3" metalness={0.5} roughness={0.35} />
      </mesh>

      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.88, 48]} />
        <meshStandardMaterial color="#f5cfd6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.96, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.07, 16, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.07, 16, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      <mesh position={[0, 1.31, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.7, 48]} />
        <meshStandardMaterial color="#fff1e0" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.06, 16, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {berries.map((p, i) => (
        <mesh key={`b${i}`} position={p}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#b4233c" roughness={0.35} />
        </mesh>
      ))}
      {pearls.map((p, i) => (
        <mesh key={`p${i}`} position={p}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#f7e7b4" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      <Candle x={-0.3} color="#7fa8ff" />
      <Candle x={0.3} color="#ff9fc0" />
      <Flame position={[-0.3, 2.37, 0]} lit={lit} delay={0} level={level} />
      <Flame position={[0.3, 2.37, 0]} lit={lit} delay={1} level={level} />
    </group>
  )
}

type Stage = 'dark' | 'lit' | 'blown'
type Mic = 'idle' | 'asking' | 'listening' | 'denied'

export default function Cake({ onNext, onCelebrate }: { onNext: () => void; onCelebrate: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const level = useRef(0)
  const micStop = useRef<(() => void) | null>(null)
  const timers = useRef<number[]>([])
  const blownRef = useRef(false)
  const [stage, setStage] = useState<Stage>('dark')
  const [ready, setReady] = useState(false)
  const [mic, setMic] = useState<Mic>('idle')
  const { him, her } = experience.kindred_spirits

  const blow = useCallback(() => {
    if (blownRef.current) return
    blownRef.current = true
    micStop.current?.()
    micStop.current = null
    level.current = 0
    setMic('idle')
    setStage('blown')
    onCelebrate()

    confetti({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0.1, y: 0.75 }, colors: COLORS })
    confetti({ particleCount: 90, angle: 120, spread: 70, origin: { x: 0.9, y: 0.75 }, colors: COLORS })
    for (let i = 0; i < 7; i++) {
      timers.current.push(
        window.setTimeout(() => {
          confetti({
            particleCount: 70,
            spread: 360,
            startVelocity: 25,
            gravity: 0.8,
            ticks: 90,
            origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.4 + 0.1 },
            colors: COLORS,
          })
        }, 500 + i * 450),
      )
    }
  }, [onCelebrate])

  const startMic = async () => {
    setMic('asking')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      const ctx = new AudioContext()
      await ctx.resume()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      ctx.createMediaStreamSource(stream).connect(analyser)
      const buf = new Uint8Array(analyser.fftSize)

      let raf = 0
      let acc = 0
      let last = performance.now()

      micStop.current = () => {
        cancelAnimationFrame(raf)
        stream.getTracks().forEach((t) => t.stop())
        void ctx.close()
      }

      const loop = () => {
        analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const x = (buf[i] - 128) / 128
          sum += x * x
        }
        const rms = Math.sqrt(sum / buf.length)
        const now = performance.now()
        const dt = (now - last) / 1000
        last = now

        const lvl = Math.min(1, Math.max(0, (rms - 0.02) / 0.25))
        level.current += (lvl - level.current) * 0.3
        acc += level.current > THRESHOLD ? dt : -dt * 0.8
        acc = Math.max(0, acc)

        if (acc > BLOW_SECONDS) {
          blow()
          return
        }
        raf = requestAnimationFrame(loop)
      }

      setMic('listening')
      loop()
    } catch {
      setMic('denied')
    }
  }

  const relight = () => {
    blownRef.current = false
    confetti.reset()
    setStage('lit')
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.head > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.25 })
    }, root)
    const list = timers.current
    list.push(window.setTimeout(() => setStage('lit'), 900))
    list.push(window.setTimeout(() => setReady(true), 3200))
    return () => {
      ctx.revert()
      list.forEach((id) => window.clearTimeout(id))
      micStop.current?.()
      confetti.reset()
    }
  }, [])

  return (
    <div ref={root} className="relative z-10 h-[100svh] w-full overflow-hidden text-white">
      <div className="absolute inset-0 touch-none">
        <Canvas camera={{ position: [0, 3.2, 7.2], fov: 36 }} dpr={[1, 1.75]}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 4]} intensity={1.2} color="#ffe9d0" />
          <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#9db4ff" />
          <CakeModel lit={stage === 'lit'} level={level} />
          <OrbitControls
            target={[0, 1.1, 0]}
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={1.2}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 2.15}
          />
        </Canvas>
      </div>

      <div className="head pointer-events-none absolute inset-x-0 top-0 px-6 pt-16 text-center">
        <p className="text-xs tracking-[0.4em] text-white/50">CHAPTER FOUR</p>
        <h2 className="mt-3 font-serif text-4xl sm:text-5xl">The Cake</h2>
        <p className="mt-2 font-serif italic text-white/60">Drag to turn it</p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-6 pb-10 text-center">
        {stage === 'blown' ? (
          <div className="chapter-in flex flex-col items-center gap-2">
            <p className="font-serif text-4xl sm:text-5xl">Happy Birthday</p>
            <p className="font-serif text-xl italic text-amber-200">
              {him.name} &amp; {her.name}
            </p>
            <div className="pointer-events-auto mt-4 flex gap-3">
              <button
                onClick={onNext}
                className="rounded-full border border-white/40 px-8 py-3 text-sm tracking-[0.3em] transition hover:bg-white/10"
              >
                CONTINUE →
              </button>
              <button
                onClick={relight}
                className="rounded-full border border-white/20 px-5 py-3 text-xs tracking-[0.25em] text-white/70 transition hover:bg-white/10"
              >
                RELIGHT
              </button>
            </div>
          </div>
        ) : !ready ? (
          <p className="text-sm tracking-[0.3em] text-white/50">LIGHTING THE CANDLES…</p>
        ) : (
          <>
            <p className="font-serif text-2xl italic">
              {mic === 'listening' ? 'Now… blow!' : 'Make a wish. Together.'}
            </p>
            {mic === 'denied' && (
              <p className="text-xs tracking-[0.2em] text-white/50">Microphone not available. Tap instead.</p>
            )}
            {(mic === 'idle' || mic === 'asking') && (
              <button
                onClick={startMic}
                disabled={mic === 'asking'}
                className="pointer-events-auto rounded-full border border-white/40 px-8 py-3 text-sm tracking-[0.3em] transition hover:bg-white/10 disabled:opacity-50"
              >
                🎤 BLOW OUT THE CANDLES
              </button>
            )}
            <button
              onClick={blow}
              className="pointer-events-auto text-xs tracking-[0.3em] text-white/60 underline underline-offset-4 hover:text-white"
            >
              OR TAP TO BLOW THEM OUT
            </button>
          </>
        )}
      </div>
    </div>
  )
}
