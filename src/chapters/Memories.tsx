import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { memories } from '../config/memories'
import type { Memory } from '../config/memories'

// x / y are the card centre as a % of the screen; d is the parallax depth
const slots = [
  { x: 18, y: 34, w: 150, rot: -6, d: 0.9 }, // him
  { x: 20, y: 66, w: 140, rot: 4, d: 0.7 }, // him
  { x: 50, y: 40, w: 160, rot: -2, d: 1 }, // both
  { x: 50, y: 70, w: 150, rot: 3, d: 0.8 }, // both
  { x: 82, y: 34, w: 150, rot: 5, d: 0.9 }, // her
  { x: 80, y: 66, w: 140, rot: -4, d: 0.7 }, // her
]

function Photo({ m, className = '', contain = false }: { m: Memory; className?: string; contain?: boolean }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-linear-to-br from-indigo-900/70 to-amber-700/40 p-2 text-center font-serif text-xs italic text-white/70 ${className}`}
      >
        {m.date}
      </div>
    )
  }
  return (
    <img
      src={m.src}
      alt={m.caption}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${contain ? 'object-contain' : 'object-cover'} ${className}`}
    />
  )
}

function Lightbox({ m, onClose }: { m: Memory; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })
    gsap.fromTo('.lb-body', { scale: 0.85, y: 20 }, { scale: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    <div
      ref={ref}
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm"
    >
      <figure className="lb-body max-w-md text-center" onClick={(e) => e.stopPropagation()}>
        <Photo
          m={m}
          contain
          className="mx-auto aspect-[3/4] max-h-[65vh] w-72 rounded-xl border border-white/20 bg-black/40 sm:w-80"
        />
        <figcaption className="mt-5">
          <p className="text-xs tracking-[0.35em] text-amber-200/80">{m.date}</p>
          <p className="mt-2 font-serif text-xl italic text-white/90">{m.caption}</p>
          <p className="mt-6 text-xs tracking-[0.3em] text-white/40">TAP ANYWHERE TO CLOSE</p>
        </figcaption>
      </figure>
    </div>
  )
}

export default function Memories({ onNext }: { onNext: () => void }) {
  const stage = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])

  useEffect(() => {
    window.scrollTo(0, 0)
    const quick: { x: ReturnType<typeof gsap.quickTo>; y: ReturnType<typeof gsap.quickTo>; d: number }[] = []

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.card')
      cards.forEach((el, i) => {
        const slot = slots[i % slots.length]
        gsap.set(el, { xPercent: -50, yPercent: -50, rotation: slot.rot })
        gsap.fromTo(el, { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 1.4, delay: 0.4 + i * 0.2, ease: 'power3.out' })
        gsap.to(el, {
          x: gsap.utils.random(-18, 18),
          y: gsap.utils.random(-26, 26),
          rotation: slot.rot + gsap.utils.random(-3, 3),
          duration: gsap.utils.random(4, 7),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.3,
        })
        const par = el.querySelector('.par') as HTMLElement
        quick.push({
          x: gsap.quickTo(par, 'x', { duration: 0.9, ease: 'power3' }),
          y: gsap.quickTo(par, 'y', { duration: 0.9, ease: 'power3' }),
          d: slot.d,
        })
      })
      gsap.from('.head > *', { opacity: 0, y: 16, duration: 1.2, stagger: 0.25 })
    }, stage)

    const move = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      quick.forEach((q) => {
        q.x(-nx * 40 * q.d)
        q.y(-ny * 40 * q.d)
      })
    }
    window.addEventListener('pointermove', move)

    return () => {
      window.removeEventListener('pointermove', move)
      ctx.revert()
    }
  }, [])

  return (
    <div ref={stage} className="relative z-10 h-[100svh] w-full overflow-hidden text-white">
      <div className="head pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-16 text-center">
        <p className="text-xs tracking-[0.4em] text-white/50">CHAPTER TWO</p>
        <h2 className="mt-3 font-serif text-4xl sm:text-5xl">The Memory Universe</h2>
        <p className="mt-2 font-serif italic text-white/60">Tap a memory</p>
      </div>

      {memories.map((m, i) => {
        const s = slots[i % slots.length]
        return (
          <div
            key={i}
            className="card absolute opacity-0"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `min(${s.w}px, 28vw)` }}
          >
            <div className="par">
              <button
                onClick={() => setOpen(i)}
                className="block w-full rounded-lg border border-white/20 bg-white/10 p-1.5 shadow-[0_0_30px_rgba(255,255,255,0.12)] backdrop-blur transition hover:scale-105"
              >
                <Photo m={m} className="aspect-[3/4] w-full rounded" />
              </button>
            </div>
          </div>
        )
      })}

      <button
        onClick={onNext}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/40 bg-black/30 px-8 py-3 text-sm tracking-[0.3em] backdrop-blur transition hover:bg-white/10"
      >
        CONTINUE →
      </button>

      {open !== null && <Lightbox m={memories[open]} onClose={close} />}
    </div>
  )
}
