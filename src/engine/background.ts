export type Mood = 'stars' | 'lights' | 'celebration'

interface Particle {
  x: number; y: number; r: number
  vx: number; vy: number
  phase: number; depth: number; hue: number
}

export class Background {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private lite: boolean
  private ps: Particle[] = []
  private mood: Mood = 'stars'
  private w = 0
  private h = 0
  private px = 0
  private py = 0
  private tx = 0
  private ty = 0
  private fade = 0
  private raf = 0
  private last = 0
  private time = 0

  constructor(canvas: HTMLCanvasElement, lite = false) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas not supported')
    this.ctx = ctx
    this.lite = lite
    this.resize()
    this.seed()
    window.addEventListener('resize', this.resize)
    window.addEventListener('pointermove', this.onPointer)
  }

  private resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.canvas.width = this.w * dpr
    this.canvas.height = this.h * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  private onPointer = (e: PointerEvent) => {
    this.tx = (e.clientX / this.w - 0.5) * 2
    this.ty = (e.clientY / this.h - 0.5) * 2
  }

  private seed() {
    const n = this.lite ? 60 : 140
    this.ps = Array.from({ length: n }, () => this.make(true))
    this.fade = 0
  }

  private make(anywhere: boolean): Particle {
    const rnd = Math.random
    const p: Particle = {
      x: rnd() * this.w,
      y: anywhere ? rnd() * this.h : this.h + 20,
      r: 1, vx: 0, vy: 0,
      phase: rnd() * Math.PI * 2,
      depth: 0.3 + rnd() * 0.7,
      hue: 220,
    }
    if (this.mood === 'stars') {
      p.r = 0.6 + rnd() * 1.6
      p.vy = -(2 + rnd() * 6)
      p.vx = (rnd() - 0.5) * 2
      p.hue = 210 + rnd() * 50
    } else if (this.mood === 'lights') {
      p.r = 8 + rnd() * 24
      p.vy = -(8 + rnd() * 18)
      p.vx = (rnd() - 0.5) * 6
      p.hue = 28 + rnd() * 30
    } else {
      p.r = 1.5 + rnd() * 3.5
      p.vy = -(60 + rnd() * 160)
      p.vx = (rnd() - 0.5) * 40
      p.hue = rnd() * 360
    }
    return p
  }

  private loop = (t: number) => {
    const dt = Math.min(0.05, (t - (this.last || t)) / 1000)
    this.last = t
    this.time += dt
    this.fade = Math.min(1, this.fade + dt)
    this.px += (this.tx - this.px) * 0.05
    this.py += (this.ty - this.py) * 0.05

    const { ctx, w, h } = this
    ctx.clearRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0; i < this.ps.length; i++) {
      const p = this.ps[i]
      const sway = this.mood === 'lights' ? Math.sin(this.time * 0.6 + p.phase) * 6 : 0
      p.x += (p.vx + sway) * dt
      p.y += p.vy * dt
      if (p.y < -40 || p.x < -40 || p.x > w + 40) {
        this.ps[i] = this.make(false)
        continue
      }
      const x = p.x + this.px * p.depth * 24
      const y = p.y + this.py * p.depth * 24
      const speed = this.mood === 'celebration' ? 4 : 1.4
      const tw = 0.5 + 0.5 * Math.sin(this.time * speed + p.phase)

      if (this.mood === 'lights') {
        const a = (0.1 + 0.14 * tw) * this.fade
        const g = ctx.createRadialGradient(x, y, 0, x, y, p.r)
        g.addColorStop(0, `hsla(${p.hue},90%,70%,${a})`)
        g.addColorStop(1, `hsla(${p.hue},90%,60%,0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, p.r, 0, Math.PI * 2)
        ctx.fill()
      } else {
        const a = (0.25 + 0.75 * tw) * p.depth * this.fade
        const party = this.mood === 'celebration'
        ctx.fillStyle = `hsla(${p.hue},${party ? 90 : 60}%,${party ? 65 : 85}%,${a})`
        ctx.beginPath()
        ctx.arc(x, y, p.r * p.depth + 0.3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    this.raf = requestAnimationFrame(this.loop)
  }

  setMood(m: Mood) {
    if (m === this.mood) return
    this.mood = m
    this.seed()
  }

  start() {
    if (!this.raf) this.raf = requestAnimationFrame(this.loop)
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.last = 0
  }

  destroy() {
    this.stop()
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('pointermove', this.onPointer)
  }
}
