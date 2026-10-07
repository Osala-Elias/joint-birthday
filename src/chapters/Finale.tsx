import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Fireworks } from '../engine/fireworks'
import { experience } from '../config/experience'
import { finale } from '../config/finale'

const lite =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  (navigator.hardwareConcurrency || 8) <= 4

interface L {
  id: number
  x: number
  wish: string
}

function Lantern({ l, onDone }: { l: L; onDone: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const h = window.innerHeight
    const tl = gsap.timeline({ onComplete: () => onDone(l.id) })
    tl.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power1.out' }, 0)
    tl.to(el, { y: -(h + 220), duration: 22, ease: 'none' }, 0)
    tl.to(el, { x: gsap.utils.random(-45, 45), duration: 7, ease: 'sine.inOut', yoyo: true, repeat: 2 }, 0)
    tl.to(el, { opacity: 0, duration: 4 }, 18)
    return () => {
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed z-30 flex flex-col items-center opacity-0"
      style={{ left: `${l.x}%`, bottom: '22vh', width: 150, marginLeft: -75 }}
    >
      <div
        style={{
          width: 56,
          height: 72,
          borderRadius: '12px 12px 20px 20px',
          background: 'radial-gradient(circle at 50% 70%, #fff3c4 0%, #ffb347 55%, #e0742a 100%)',
          border: '1px solid rgba(255,230,170,0.6)',
          boxShadow: '0 0 40px 12px rgba(255,170,70,0.55), 0 0 90px 30px rgba(255,140,40,0.25)',
        }}
      />
      <p
        className="mt-4 text-center font-serif text-sm italic leading-snug"
        style={{ color: '#ffe7b0', textShadow: '0 0 12px rgba(255,170,70,0.8)' }}
      >
        {l.wish}
      </p>
    </div>
  )
}

export default function Finale({ onRestart }: { onRestart: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const fw = useRef<Fireworks | null>(null)
  const nextId = useRef(0)
  const [lanterns, setLanterns] = useState<L[]>([])
  const [released, setReleased] = useState(0)
  const [ready, setReady] = useState(false)
  const { him, her } = experience.kindred_spirits
  const total = finale.wishes.length
  const finished = released >= total

  useEffect(() => {
    window.scrollTo(0, 0)
    const f = new Fireworks(cv.current!, lite)
    fw.current = f
    f.start()

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.6 })
      finale.lines.forEach((_, i) => {
        tl.fromTo(
          `.f-line-${i}`,
          { opacity: 0, y: 14, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' },
        ).to(`.f-line-${i}`, { opacity: 0, y: -10, duration: 0.8, ease: 'power1.in' }, '+=0.8')
      })
      tl.call(() => {
        f.setAuto(true)
        f.salvo(6)
      })
        .fromTo('.f-happy', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.2 })
        .fromTo(
          '.f-names',
          { opacity: 0, scale: 0.92, filter: 'blur(14px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 2.2, ease: 'power3.out' },
          '-=0.6',
        )
        .fromTo('.f-dates', { opacity: 0 }, { opacity: 1, duration: 1.2 }, '-=0.8')
        .fromTo('.f-closing', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.4 }, '+=0.4')
        .fromTo('.f-actions', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.2 }, '+=0.6')
        .call(() => setReady(true))
    }, root)

    return () => {
      ctx.revert()
      f.destroy()
      fw.current = null
    }
  }, [])

  const done = useCallback((id: number) => {
    setLanterns((ls) => ls.filter((l) => l.id !== id))
  }, [])

  const release = () => {
    if (finished || !ready) return
    const id = nextId.current++
    setLanterns((ls) => [...ls, { id, x: 18 + ((id * 29) % 64), wish: finale.wishes[released] }])
    fw.current?.launch()
    const n = released + 1
    setReleased(n)
    if (n >= total) {
      window.setTimeout(() => fw.current?.salvo(12), 2500)
    }
  }

  return (
    <div ref={root} className="text-white">
      <canvas
        ref={cv}
        onPointerDown={(e) => fw.current?.launch(e.clientX, e.clientY)}
        className="fixed inset-0 z-10 h-full w-full cursor-pointer"
      />

      <div className="pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center px-6 pb-40 text-center">
        {finale.lines.map((line, i) => (
          <p
            key={i}
            className={`f-line-${i} absolute max-w-md font-serif text-2xl italic opacity-0 sm:text-3xl`}
          >
            {line}
          </p>
        ))}

        <p className="f-happy text-xs tracking-[0.5em] text-amber-200/90 opacity-0">HAPPY BIRTHDAY</p>
        <div className="f-names mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 opacity-0">
          <h2 className="font-serif text-5xl tracking-[0.15em] sm:text-7xl md:text-8xl">
            {him.name.toUpperCase()}
          </h2>
          <span className="font-serif text-3xl text-amber-200 sm:text-5xl">&amp;</span>
          <h2 className="font-serif text-5xl tracking-[0.15em] sm:text-7xl md:text-8xl">
            {her.name.toUpperCase()}
          </h2>
        </div>
        <p className="f-dates mt-6 text-sm tracking-[0.35em] text-white/70 opacity-0">{experience.displayDates}</p>
        <p className="f-closing mt-8 max-w-md font-serif text-xl italic text-white/85 opacity-0 sm:text-2xl">
          {finale.closing}
        </p>
      </div>

      {lanterns.map((l) => (
        <Lantern key={l.id} l={l} onDone={done} />
      ))}

      <div className="f-actions pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-3 px-6 pb-8 text-center opacity-0">
        {finished ? (
          <p className="chapter-in font-serif text-xl italic text-amber-200 sm:text-2xl">
            Happy birthday, {him.name}. Happy birthday, {her.name}.
          </p>
        ) : (
          <button
            onClick={release}
            disabled={!ready}
            className="pointer-events-auto rounded-full border border-amber-200/60 px-8 py-3 text-sm tracking-[0.3em] text-amber-100 transition hover:bg-amber-200/10 disabled:opacity-50"
          >
            🏮 RELEASE A WISH · {total - released} LEFT
          </button>
        )}
        <p className="text-xs tracking-[0.3em] text-white/45">TAP THE SKY FOR FIREWORKS</p>
        <button
          onClick={onRestart}
          disabled={!ready}
          className="pointer-events-auto text-xs tracking-[0.3em] text-white/55 underline underline-offset-4 transition hover:text-white"
        >
          ↺ BEGIN AGAIN
        </button>
      </div>
    </div>
  )
}
