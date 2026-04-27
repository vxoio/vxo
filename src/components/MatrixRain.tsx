"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

/*
 * MatrixRain — full-screen canvas easter egg.
 * Triggered by: sudo vxo --access
 * Dismiss:      click or Escape
 */

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*><[]{}|"

interface Column {
  x: number
  y: number
  speed: number
  opacity: number
  chars: string[]
}

export default function MatrixRain({ onDismiss }: { onDismiss: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext("2d")!
    const wrap   = wrapRef.current!

    // Fade in
    gsap.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" })

    const FONT_SIZE = 14
    let cols: Column[] = []

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      const count   = Math.floor(canvas.width / FONT_SIZE)
      cols = Array.from({ length: count }, (_, i) => ({
        x:       i * FONT_SIZE,
        y:       Math.random() * canvas.height,
        speed:   (Math.random() * 0.7 + 0.4) * FONT_SIZE,
        opacity: Math.random() * 0.5 + 0.3,
        chars:   Array.from({ length: 30 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
      }))
    }

    resize()
    window.addEventListener("resize", resize)

    let last = 0
    const FPS = 24

    function draw(ts: number) {
      rafRef.current = requestAnimationFrame(draw)
      if (ts - last < 1000 / FPS) return
      last = ts

      // Fade trail
      ctx.fillStyle = "rgba(7, 11, 15, 0.18)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`

      cols.forEach(col => {
        // Draw column characters
        col.chars.forEach((ch, i) => {
          const y = col.y - i * FONT_SIZE
          if (y < 0 || y > canvas.height) return

          const frac = i / col.chars.length
          if (i === 0) {
            // Head — bright white
            ctx.fillStyle = `rgba(180, 255, 180, ${col.opacity})`
          } else if (frac < 0.15) {
            // Near head — bright green
            ctx.fillStyle = `rgba(0, 255, 65, ${col.opacity * (1 - frac * 3)})`
          } else {
            // Tail — dim green
            const a = col.opacity * (1 - frac) * 0.5
            ctx.fillStyle = `rgba(0, 200, 50, ${a})`
          }

          // Randomly flicker a character
          if (Math.random() < 0.03) {
            col.chars[i] = CHARS[Math.floor(Math.random() * CHARS.length)]
          }

          ctx.fillText(ch, col.x, y)
        })

        // Advance column
        col.y += col.speed
        if (col.y > canvas.height + col.chars.length * FONT_SIZE) {
          col.y     = -FONT_SIZE
          col.speed = (Math.random() * 0.7 + 0.4) * FONT_SIZE
        }
      })
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [])

  const dismiss = () => {
    gsap.to(wrapRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: onDismiss,
    })
  }

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") dismiss()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[100] cursor-pointer"
      onClick={dismiss}
      role="presentation"
      aria-label="Matrix rain. Click or press Escape to exit."
    >
      <canvas ref={canvasRef} id="matrix-canvas" className="absolute inset-0" />

      {/* Central message */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center space-y-2">
          <p className="font-mono text-4xl text-vxo-green text-glow-green glitch" data-text="ROOT ACCESS">
            ROOT ACCESS
          </p>
          <p className="font-mono text-sm text-vxo-green/60">
            click or press ESC to exit
          </p>
        </div>
      </div>
    </div>
  )
}
