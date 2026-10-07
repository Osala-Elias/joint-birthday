import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experience } from '../config/experience'
import { story } from '../config/story'

gsap.registerPlugin(ScrollTrigger)

export default function Story({ onNext }: { onNext: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const { him, her } = experience.kindred_spirits

  useEffect(() => {
    window.scrollTo(0, 0)
    const ctx = gsap.context(() => {
      gsap.from('.intro > *', { opacity: 0, y: 20, duration: 1.4, stagger: 0.3, delay: 0.3 })

      gsap.fromTo(
        '.spine',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 80%', scrub: true },
        },
      )

      gsap.utils.toArray<HTMLElement>('.moment').forEach((el) => {
        gsap.from(el.querySelectorAll('.reveal'), {
          opacity: 0,
          y: 30,
          duration: 1,
          stagger: 0.25,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%' },
        })
      })

      gsap.from('.next', {
        opacity: 0,
        y: 20,
        duration: 1,
        scrollTrigger: { trigger: '.next', start: 'top 95%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="relative z-10 min-h-screen px-6 py-24 text-white">
      <div className="intro mx-auto mb-20 max-w-2xl text-center">
        <p className="text-xs tracking-[0.4em] text-white/50">CHAPTER ONE</p>
        <h2 className="mt-4 font-serif text-5xl sm:text-6xl">How we remember it</h2>
        <p className="mt-4 font-serif text-lg italic text-white/70">
          Two kindred spirits. Two memories of the same moments.
        </p>
      </div>

      <div className="timeline relative mx-auto max-w-2xl pl-8">
        <div className="spine absolute left-0 top-0 h-full w-px bg-linear-to-b from-amber-200/80 via-amber-200/40 to-transparent" />

        {story.map((m, i) => (
          <section key={i} className="moment relative pb-24">
            <span className="absolute left-0 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-200 shadow-[0_0_18px_rgba(253,230,138,0.9)]" />
            <p className="reveal text-xs tracking-[0.35em] text-amber-200/80">{m.date}</p>
            <h3 className="reveal mt-2 font-serif text-3xl sm:text-4xl">{m.title}</h3>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="reveal rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="mb-2 text-xs tracking-[0.3em] text-white/50">{him.name.toUpperCase()} REMEMBERS</p>
                <p className="font-serif text-lg leading-relaxed text-white/90">{m.him}</p>
              </div>
              <div className="reveal rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="mb-2 text-xs tracking-[0.3em] text-white/50">{her.name.toUpperCase()} REMEMBERS</p>
                <p className="font-serif text-lg leading-relaxed text-white/90">{m.her}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="next mx-auto mt-4 max-w-2xl text-center">
        <button
          onClick={onNext}
          className="rounded-full border border-white/40 px-8 py-3 text-sm tracking-[0.3em] transition hover:bg-white/10"
        >
          CONTINUE →
        </button>
      </div>
    </div>
  )
}
