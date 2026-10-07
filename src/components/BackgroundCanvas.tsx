import { useEffect, useRef } from 'react'
import { Background } from '../engine/background'
import type { Mood } from '../engine/background'

const lite =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  (navigator.hardwareConcurrency || 8) <= 4

export default function BackgroundCanvas({ mood }: { mood: Mood }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const bg = useRef<Background | null>(null)

  useEffect(() => {
    const b = new Background(ref.current!, lite)
    bg.current = b
    b.start()
    return () => {
      b.destroy()
      bg.current = null
    }
  }, [])

  useEffect(() => {
    bg.current?.setMood(mood)
  }, [mood])

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
}
