import { useEffect, useRef } from 'react'

interface Particle {
  cx: number
  y: number
  r: number
  s: number
  o: number
  ph: number
  depth: number
  kind: number
}

const COLORS = ['46, 130, 146', '248, 200, 48', '116, 157, 91', '16, 184, 208']

function Background() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const reduced =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false

    let width = 0
    let height = 0
    let raf = 0
    let mx = 0
    let my = 0
    let cx = 0
    let cy = 0
    let particles: Particle[] = []

    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    const spawn = (): Particle => ({
      cx: rand(0, width),
      y: rand(height, height + 140),
      r: rand(3, 12),
      s: rand(0.35, 1.25),
      o: rand(0.18, 0.45),
      ph: rand(0, Math.PI * 2),
      depth: rand(0.15, 1),
      kind: Math.floor(Math.random() * 4),
    })

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const drawOne = (p: Particle) => {
      cx += (mx - cx) * 0.05
      cy += (my - cy) * 0.05
      const px = p.cx + Math.sin(p.ph) * 14 + p.depth * cx * 0.06 * (p.r / 4)
      const py = p.y + p.depth * cy * 0.06 * (p.r / 4)
      const color = COLORS[p.kind]

      ctx.beginPath()
      ctx.arc(px, py, p.r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${color}, ${p.o})`
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = `rgba(${color}, ${p.o * 0.5})`
      ctx.fill()

      if (p.kind === 1) {
        ctx.beginPath()
        ctx.moveTo(px - p.r * 1.6, py)
        ctx.lineTo(px + p.r * 1.6, py)
        ctx.moveTo(px, py - p.r * 1.6)
        ctx.lineTo(px, py + p.r * 1.6)
        ctx.strokeStyle = `rgba(248, 200, 48, ${p.o * 0.8})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    const frame = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.y -= p.s
        p.ph += 0.004
        if (p.y < -30) {
          p.y = height + 30
          p.cx = rand(0, width)
        }
        drawOne(p)
      }
      raf = requestAnimationFrame(frame)
    }

    const staticDraw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        drawOne(p)
      }
    }

    const init = () => {
      resize()
      particles = []
      const count = Math.min(120, Math.floor((width * height) / 8000))
      for (let i = 0; i < count; i += 1) {
        particles.push(spawn())
      }
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
      if (reduced) {
        staticDraw()
      } else {
        raf = requestAnimationFrame(frame)
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      mx = event.clientX - width / 2
      my = event.clientY - height / 2
    }

    window.addEventListener('resize', init)
    window.addEventListener('mousemove', onMouseMove)
    init()

    return () => {
      if (raf) {
        cancelAnimationFrame(raf)
      }
      window.removeEventListener('resize', init)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-60"
      />
      <div className="absolute -left-24 -top-24 h-96 w-96 animate-[drift_14s_ease-in-out_infinite] rounded-full bg-green-300/40 blur-3xl" />
      <div className="absolute right-[-8%] top-1/3 h-80 w-80 animate-[drift_11s_ease-in-out_infinite] rounded-full bg-green-200/50 blur-3xl" />
      <div className="absolute bottom-[18%] left-[4%] h-72 w-72 animate-[drift_16s_ease-in-out_infinite] rounded-full bg-green-300/30 blur-3xl" />
      <div className="absolute left-[36%] top-[10%] h-64 w-64 animate-[drift_12s_ease-in-out_infinite] rounded-full bg-teal-100/70 blur-3xl" />
      <div className="absolute -bottom-12 right-[16%] h-96 w-96 animate-[drift_18s_ease-in-out_infinite] rounded-full bg-green-200/40 blur-3xl" />
    </div>
  )
}

export default Background