import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { experience } from '../config/experience'

export default function Arrival({ onStart, onEnter }: { onStart: () => void; onEnter: () => void }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.8 })
        .fromTo('.line', { opacity: 0, y: 14, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 2.2, ease: 'power2.out' })
        .to('.line', { opacity: 0, y: -10, duration: 1.4, ease: 'power1.in' }, '+=1.6')
        .fromTo('.name-him', { opacity: 0, x: -120 },
          { opacity: 1, x: 0, duration: 2, ease: 'power3.out' }, '+=0.2')
        .fromTo('.name-her', { opacity: 0, x: 120 },
          { opacity: 1, x: 0, duration: 2, ease: 'power3.out' }, '<0.6')
        .fromTo('.cross', { opacity: 0, scale: 0.2 },
          { opacity: 1, scale: 1, duration: 1, ease: 'back.out(2)' }, '-=0.6')
        .fromTo('.dates', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.2 }, '-=0.2')
        .fromTo('.tagline', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.2 }, '-=0.4')
        .fromTo('.enter', { opacity: 0 }, { opacity: 1, duration: 1.2 }, '+=0.4')

      // faint hint that fades away on its own, or at the first tap
      gsap
        .timeline()
        .fromTo('.hint', { opacity: 0 }, { opacity: 1, duration: 1.5, delay: 1 })
        .to('.hint', { opacity: 0, duration: 1, delay: 9 })
    }, root)

    const hide = () => {
      gsap.killTweensOf('.hint')
      gsap.to('.hint', { opacity: 0, duration: 0.6 })
    }
    window.addEventListener('pointerdown', hide, { once: true })
    window.addEventListener('keydown', hide, { once: true })

    return () => {
      window.removeEventListener('pointerdown', hide)
      window.removeEventListener('keydown', hide)
      ctx.revert()
    }
  }, [])

  const enter = () => {
    onStart() // no-op if the music is already playing
    gsap.to(root.current, { opacity: 0, duration: 1.2, onComplete: onEnter })
  }

  const { him, her } = experience.kindred_spirits

  return (
    <div ref={root} className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
      <p className="line absolute max-w-md font-serif text-xl italic opacity-0 sm:text-2xl">
        {experience.lines[0]}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:gap-x-8">
        <h1 className="name-him font-serif text-4xl tracking-[0.2em] opacity-0 sm:text-6xl md:text-8xl">
          {him.name.toUpperCase()}
        </h1>
        <span className="cross text-2xl text-amber-200 opacity-0">×</span>
        <h1 className="name-her font-serif text-4xl tracking-[0.2em] opacity-0 sm:text-6xl md:text-8xl">
          {her.name.toUpperCase()}
        </h1>
      </div>

      <p className="dates mt-6 text-sm tracking-[0.35em] text-white/70 opacity-0">{experience.displayDates}</p>
      <p className="tagline mt-3 font-serif text-lg italic text-white/80 opacity-0">{experience.tagline}</p>

      <button
        onClick={enter}
        className="enter mt-12 rounded-full border border-white/40 px-8 py-3 text-sm tracking-[0.3em] opacity-0 transition hover:bg-white/10"
      >
        ENTER →
      </button>

      <p className="hint pointer-events-none absolute inset-x-0 bottom-8 text-center text-xs tracking-[0.3em] text-white/50 opacity-0">
        ♪ TAP ANYWHERE FOR SOUND
      </p>
    </div>
  )
}
