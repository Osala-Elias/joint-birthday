interface Spark {
  x: number; y: number; vx: number; vy: number
  life: number; max: number; hue: number; size: number
}
interface Rocket {
  x: number; y: number; ty: number; vx: number; vy: number; hue: number
}

const HUES = [42, 330, 210, 285, 18, 160]

export class Fireworks {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private lite: boolean
  private w = 0
  private h = 0
  private sparks: Spark[] = []
  private rockets: Rocket[] = []
  private timers: number[] = []
  private raf = 0
  private last = 0
  private auto = false
  private nextAuto = 0

  constructor(canvas: HTMLCanvasElement, lite = false) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas not supported')
    this.ctx = ctx
    this.lite = lite
    this.resize()
    window.addEventListener('resize', this.resize)
  }

  private resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.canvas.width = this.w * dpr
    this.canvas.height = this.h * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  private pickHue() {
    return HUES[Math.floor(Math.random() * HUES.length)] + (Math.random() - 0.5) * 20
  }

  setAuto(on: boolean) {
    this.auto = on
    this.nextAuto = 0.4
  }

  launch(tx?: number, ty?: number) {
    const x0 = tx !== undefined ? tx + (Math.random() - 0.5) * 60 : this.w * (0.12 + Math.random() * 0.76)
    const targetX = tx ?? x0 + (Math.random() - 0.5) * 120
    let targetY = ty ?? this.h * (0.14 + Math.random() * 0.34)
    targetY = Math.min(targetY, this.h * 0.7)
    const dx = targetX - x0
    const dy = targetY - this.h
    const dist = Math.hypot(dx, dy) || 1
    const speed = 700
    this.rockets.push({
      x: x0, y: this.h, ty: targetY,
      vx: (dx / dist) * speed, vy: (dy / dist) * speed,
      hue: this.pickHue(),
    })
  }

  salvo(n: number) {
    for (let i = 0; i < n; i++) {
      this.timers.push(window.setTimeout(() => this.launch(), i * 220))
    }
  }

  private explode(x: number, y: number, hue: number) {
    const n = this.lite ? 45 : 90
    const ring = Math.random() < 0.35
    const two = Math.random() < 0.3
    for (let i = 0; i < n; i++) {
      const a = ring ? (i / n) * Math.PI * 2 : Math.random() * Math.PI * 2
      const sp = ring ? 190 : 40 + Math.random() * 230
      const h2 = two && i % 2 ? (hue + 180) % 360 : hue + (Math.random() - 0.5) * 30
      this.sparks.push({
        x, y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 0, max: 1.1 + Math.random() * 0.9,
        hue: h2, size: 1.4 + Math.random() * 1.6,
      })
    }
  }

  private loop = (t: number) => {
    const dt = Math.min(0.05, (t - (this.last || t)) / 1000)
    this.last = t
    const { ctx, w, h } = this

    if (this.sparks.length === 0 && this.rockets.length === 0) {
      ctx.clearRect(0, 0, w, h) // wipe any faint leftover haze
    } else {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fillRect(0, 0, w, h)
    }
    ctx.globalCompositeOperation = 'lighter'

    if (this.auto) {
      this.nextAuto -= dt
      if (this.nextAuto <= 0) {
        this.launch()
        this.nextAuto = 0.7 + Math.random() * 1.1
      }
    }

    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i]
      r.x += r.vx * dt
      r.y += r.vy * dt
      ctx.fillStyle = 'rgba(255,230,170,0.9)'
      ctx.beginPath()
      ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2)
      ctx.fill()
      if (r.y <= r.ty) {
        this.explode(r.x, r.y, r.hue)
        this.rockets.splice(i, 1)
      }
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i]
      s.life += dt
      if (s.life >= s.max) {
        this.sparks.splice(i, 1)
        continue
      }
      s.vx *= 1 - 1.2 * dt
      s.vy = s.vy * (1 - 1.2 * dt) + 140 * dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      const alpha = 1 - s.life / s.max
      ctx.fillStyle = `hsla(${s.hue},100%,65%,${alpha})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * (0.5 + alpha * 0.5), 0, Math.PI * 2)
      ctx.fill()
    }

    this.raf = requestAnimationFrame(this.loop)
  }

  start() {
    if (!this.raf) this.raf = requestAnimationFrame(this.loop)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.timers.forEach((id) => window.clearTimeout(id))
    window.removeEventListener('resize', this.resize)
  }
}
