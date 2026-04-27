"use client"

import { useEffect, useRef } from "react"

/* ── Config ─────────────────────────────────────────────────────── */
const NODE_COUNT = 140
const EDGE_DIST  = 160   // px — max distance to draw a connection
const REPEL_R    = 110   // px — mouse repulsion radius
const PALETTE    = ["#00ff41", "#00d4ff", "#00ff88", "#7c3aed", "#94a3b8"]

interface Node {
  x: number; y: number
  vx: number; vy: number
  size: number; opacity: number; color: string
}

/* ── ThreeCanvas ─────────────────────────────────────────────────── */
export default function ThreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef  = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext("2d")!
    let   rafId  = 0
    let   nodes: Node[] = []

    function init() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      const cx = canvas.width  / 2
      const cy = canvas.height / 2
      const r  = Math.min(canvas.width, canvas.height) * 0.42

      nodes = Array.from({ length: NODE_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2
        const dist  = Math.pow(Math.random(), 0.55) * r
        return {
          x:       cx + Math.cos(angle) * dist * 1.9,
          y:       cy + Math.sin(angle) * dist * 0.65,
          vx:      (Math.random() - 0.5) * 0.14,
          vy:      (Math.random() - 0.5) * 0.14,
          size:    Math.random() < 0.05 ? 3.2 : Math.random() * 1.4 + 0.5,
          opacity: Math.random() * 0.45 + 0.18,
          color:   PALETTE[Math.floor(Math.random() * PALETTE.length)],
        }
      })
    }

    function draw(ts: number) {
      rafId = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // Update positions
      for (const n of nodes) {
        const dx   = n.x - mx
        const dy   = n.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_R && dist > 0) {
          const force = (REPEL_R - dist) / REPEL_R * 0.55
          n.vx += (dx / dist) * force
          n.vy += (dy / dist) * force
        }
        n.vx *= 0.978
        n.vy *= 0.978
        // Gentle drift oscillation
        n.vx += Math.sin(ts * 0.00028 + n.y * 0.004) * 0.0015
        n.vy += Math.cos(ts * 0.00020 + n.x * 0.003) * 0.0015
        n.x  += n.vx
        n.y  += n.vy
        // Wrap
        const w = canvas.width, h = canvas.height
        if (n.x < -60) n.x = w + 60
        if (n.x > w + 60) n.x = -60
        if (n.y < -60) n.y = h + 60
        if (n.y > h + 60) n.y = -60
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < EDGE_DIST) {
            ctx.globalAlpha = (1 - d / EDGE_DIST) * 0.08
            ctx.strokeStyle = "#00ff41"
            ctx.lineWidth   = 0.5
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.globalAlpha = n.opacity
        ctx.fillStyle   = n.color
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    init()
    rafId = requestAnimationFrame(draw)

    const onMove   = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const onResize = () => init()

    window.addEventListener("mousemove", onMove,   { passive: true })
    window.addEventListener("resize",    onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("resize",    onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}
