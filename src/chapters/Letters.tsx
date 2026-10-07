import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { letters } from '../config/letters'
import type { Letter } from '../config/letters'

const TYPE_MS = 55 // base milliseconds per character: higher = slower

function Envelope({ letter, opened, onOpen }: { letter: Letter; opened: boolean; onOpen: () => void }) {
  const flap = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const [popped, setPopped] = useState(false)

  useEffect(() => {
    gsap.set(flap.current, { transformPerspective: 800, transformOrigin: 'top center' })
  }, [])

  const click = () => {
    if (busy.current) return
    busy.current = true
    setPopped(true)
    gsap.to(flap.current, {
      rotationX: -180,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        busy.current = false
        onOpen()
      },
    })
  }

  return (
    <div className="env flex flex-col items-center">
      <button
        onClick={click}
        aria-label={`Open the letter for ${letter.to}`}
        className="relative h-44 w-64 transition-transform duration-300 hover:-translate-y-1 sm:h-52 sm:w-80"
      >
        <div
          className="absolute inset-0 rounded-md"
          style={{
            background: 'linear-gradient(135deg, #f3e7cc, #cdb98f)',
            border: '1px solid rgba(255,255,255,0.35)',
            boxShadow: '0 0 40px rgba(253,230,138,0.22), 0 12px 40px rgba(0,0,0,0.55)',
          }}
        />
        <div
          ref={flap}
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background: 'linear-gradient(180deg, #dccca2, #c7b183)',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          }}
        />
        <span
          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-500"
          style={{ background: '#9f1d1d', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', opacity: popped ? 0 : 1 }}
        />
        <span
          className="absolute inset-x-0 bottom-4 text-center font-serif text-lg italic"
          style={{ color: '#5b4a2e' }}
        >
          For {letter.to}
        </span>
      </button>
      <p className="mt-5 text-xs tracking-[0.3em] text-white/60">
        {opened ? 'OPENED · TAP TO READ AGAIN' : 'TAP TO OPEN'}
      </p>
    </div>
  )
}

function LetterView({ letter, onClose }: { letter: Letter; onClose: () => void }) {
  const [shown, setShown] = useState(0)
  const timer = useRef<number | undefined>(undefined)
  const done = shown >= letter.text.length

  useEffect(() => {
    let i = 0
    const tick = () => {
      i++
      setShown(i)
      if (i >= letter.text.length) return
      const ch = letter.text[i - 1]
      const pause = '.!?'.includes(ch) ? 500 : ',;:'.includes(ch) ? 220 : ch === '\n' ? 350 : 0
      timer.current = window.setTimeout(tick, TYPE_MS + pause)
    }
    timer.current = window.setTimeout(tick, 1100)
    gsap.fromTo(
      '.paper',
      { opacity: 0, y: 60, rotation: -2 },
      { opacity: 1, y: 0, rotation: 0, duration: 1, ease: 'power3.out' },
    )
    return () => window.clearTimeout(timer.current)
  }, [letter])

  const skip = () => {
    window.clearTimeout(timer.current)
    setShown(letter.text.length)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
    >
      <div className="pointer-events-none absolute h-[70vh] w-[70vh] rounded-full bg-amber-300/10 blur-3xl" />
      <div
        className="paper relative max-h-[82vh] w-full max-w-xl cursor-pointer overflow-y-auto rounded-sm px-7 py-9 shadow-[0_25px_80px_rgba(0,0,0,0.7)] sm:px-12 sm:py-12"
        style={{ background: '#f4ead2', color: '#3b3226' }}
        onClick={(e) => {
          e.stopPropagation()
          skip()
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          aria-label="Close letter"
          className="absolute right-3 top-3 text-xl text-stone-500 hover:text-stone-800"
        >
          ✕
        </button>
        <p className="whitespace-pre-wrap font-serif text-xl leading-relaxed sm:text-2xl">
          {letter.text.slice(0, shown)}
          <span className="invisible">{letter.text.slice(shown)}</span>
        </p>
        <p className="mt-8 text-center text-xs tracking-[0.3em] text-stone-500">
          {done ? 'TAP OUTSIDE TO CLOSE' : 'TAP TO READ FASTER'}
        </p>
      </div>
    </div>
  )
}

export default function Letters({ onNext }: { onNext: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [opened, setOpened] = useState<string[]>([])
  const [reading, setReading] = useState<Letter | null>(null)
  const all = opened.length === letters.length

  useEffect(() => {
    window.scrollTo(0, 0)
    const ctx = gsap.context(() => {
      gsap.fromTo('.head > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.25 })
      gsap.fromTo(
        '.env',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.3, delay: 0.6, ease: 'power3.out' },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  const open = (l: Letter) => {
    setOpened((o) => (o.includes(l.id) ? o : [...o, l.id]))
    setReading(l)
  }

  return (
    <div ref={root} className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24 text-white">
      <div className="head mb-16 text-center">
        <p className="text-xs tracking-[0.4em] text-white/50">CHAPTER THREE</p>
        <h2 className="mt-3 font-serif text-5xl sm:text-6xl">The Letters</h2>
        <p className="mt-3 font-serif italic text-white/60">Two envelopes. Tap to open.</p>
      </div>

      <div className="flex flex-col items-center gap-16 sm:flex-row sm:gap-20">
        {letters.map((l) => (
          <Envelope key={l.id} letter={l} opened={opened.includes(l.id)} onOpen={() => open(l)} />
        ))}
      </div>

      <button
        onClick={onNext}
        className={`mt-24 rounded-full border border-white/40 px-8 py-3 text-sm tracking-[0.3em] transition hover:bg-white/10 ${
          all ? 'opacity-100' : 'opacity-40'
        }`}
      >
        CONTINUE →
      </button>

      {reading && <LetterView letter={reading} onClose={() => setReading(null)} />}
    </div>
  )
}
