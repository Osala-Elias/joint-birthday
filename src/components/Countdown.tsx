import { useEffect, useState } from 'react'

export default function Countdown({ target, onDone }: { target: string; onDone: () => void }) {
  const end = new Date(target).getTime()
  const [left, setLeft] = useState(end - Date.now())

  useEffect(() => {
    const id = window.setInterval(() => {
      const l = end - Date.now()
      setLeft(l)
      if (l <= 0) {
        window.clearInterval(id)
        onDone()
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [end, onDone])

  const s = Math.max(0, Math.floor(left / 1000))
  const parts = [
    ['days', Math.floor(s / 86400)],
    ['hours', Math.floor((s % 86400) / 3600)],
    ['min', Math.floor((s % 3600) / 60)],
    ['sec', s % 60],
  ] as const

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
      <p className="mb-8 font-serif text-2xl italic text-white/80">Something beautiful is waiting.</p>
      <div className="flex gap-5 sm:gap-8">
        {parts.map(([label, value]) => (
          <div key={label}>
            <div className="font-serif text-4xl sm:text-6xl">{String(value).padStart(2, '0')}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.3em] text-white/50">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
