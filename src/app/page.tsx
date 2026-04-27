"use client"

import { useState, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import VXO_Terminal   from "@/components/VXO_Terminal"
import HUDGrid        from "@/components/HUD/SectorPanel"
import CommandPalette from "@/components/CommandPalette"

/* ── Dynamic imports (SSR-unsafe) ────────────────────────────────── */
const ThreeCanvas = dynamic(() => import("@/components/ThreeCanvas"), {
  ssr: false,
  loading: () => null,
})
const MatrixRain = dynamic(() => import("@/components/MatrixRain"), {
  ssr: false,
})

type Phase = "terminal" | "hud"

/* ── HUD Header ───────────────────────────────────────────────────── */
function HUDHeader() {
  const ts = new Date().toLocaleString("en-US", {
    timeZone:  "America/New_York",
    month:     "2-digit",
    day:       "2-digit",
    year:      "numeric",
    hour:      "2-digit",
    minute:    "2-digit",
    second:    "2-digit",
    hour12:    false,
  }).replace(",", "") + " ET"

  return (
    <header className="
      fixed top-0 inset-x-0 z-30
      flex items-center justify-between
      px-6 py-2
      border-b border-vxo-green/10
      bg-vxo-void/80 backdrop-blur-md
      animate-hud-in [animation-delay:100ms]
    ">
      <div className="flex items-center gap-3">
        <span className="text-vxo-green text-xs font-mono">⬡</span>
        <span className="font-mono text-sm font-semibold tracking-[0.18em] text-vxo-white uppercase">
          VXO Labs
        </span>
        <span className="font-mono text-2xs text-slate-700 tracking-widest hidden sm:inline">
          / Systems &amp; Intelligence
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-2xs text-slate-700 hidden md:inline tabular-nums">{ts}</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-vxo-green status-pulse" />
          <span className="font-mono text-2xs text-vxo-green/70">ONLINE</span>
        </div>
      </div>
    </header>
  )
}

/* ── Hero copy ────────────────────────────────────────────────────── */
function HeroSection({ onEngage }: { onEngage: () => void }) {
  return (
    <section className="
      relative z-10 w-full max-w-6xl mx-auto
      px-4 pt-32 pb-4
      flex flex-col items-start
    ">
      <div className="flex items-center gap-3 mb-6 animate-hud-in [animation-delay:400ms]">
        <span className="font-mono text-2xs text-vxo-green/50 tracking-[0.3em] uppercase">/VXO/INIT</span>
        <div className="h-px w-16 bg-vxo-green/20" />
        <span className="font-mono text-2xs text-slate-700">BUILD 2026.1</span>
      </div>

      <h1 className="font-mono font-bold leading-none mb-4 animate-hud-in [animation-delay:500ms]">
        <span className="block text-4xl sm:text-6xl lg:text-7xl text-vxo-white">INFRASTRUCTURE</span>
        <span className="block text-4xl sm:text-6xl lg:text-7xl text-vxo-green text-glow-green">
          AT MACHINE SPEED.
        </span>
      </h1>

      <p className="font-sans text-base text-slate-400 max-w-xl mb-8 animate-hud-in [animation-delay:650ms]">
        Cloud-native automation, AI orchestration, and adversarial intelligence
        — engineered for zero-downtime at global scale.
      </p>

      <div className="flex items-center gap-4 flex-wrap animate-hud-in [animation-delay:800ms]">
        <button
          onClick={onEngage}
          className="
            font-mono text-xs px-5 py-2.5
            border border-vxo-green/50 bg-vxo-green/5 text-vxo-green
            hover:bg-vxo-green/10 hover:border-vxo-green
            hover:shadow-[0_0_24px_rgba(0,255,65,0.12)]
            active:scale-[0.97]
            transition-all duration-200
          "
        >
          ENGAGE SYSTEMS
        </button>
        <span className="font-mono text-2xs text-slate-600">
          or press <kbd className="text-vxo-green">⌘K</kbd> to access terminal
        </span>
      </div>
    </section>
  )
}

/* ── Footer ───────────────────────────────────────────────────────── */
function HUDFooter() {
  return (
    <footer className="
      relative z-10 w-full
      border-t border-vxo-green/10 px-6 py-3
      flex items-center justify-between
      bg-vxo-void/60 backdrop-blur-sm
      animate-hud-in [animation-delay:1200ms]
    ">
      <span className="font-mono text-2xs text-slate-700">
        © {new Date().getFullYear()} VXO Labs — All rights reserved
      </span>
      <div className="flex items-center gap-4">
        <span className="font-mono text-2xs text-slate-700 hidden sm:inline">ENC: TLS 1.3</span>
        <span className="font-mono text-2xs text-slate-700 hidden sm:inline">|</span>
        <span className="font-mono text-2xs text-vxo-green/40 animate-pulse">● SECURE</span>
      </div>
    </footer>
  )
}

/* ── Root page ────────────────────────────────────────────────────── */
export default function Page() {
  const [phase,      setPhase]      = useState<Phase>("terminal")
  const [matrixOn,   setMatrixOn]   = useState(false)
  const [pingTarget, setPingTarget] = useState<string | undefined>()
  const [cmdTrigger, setCmdTrigger] = useState(0)
  const pingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTerminalDone  = useCallback(() => setPhase("hud"), [])
  const handleMatrixTrigger = useCallback(() => setMatrixOn(true), [])
  const handleMatrixDismiss = useCallback(() => setMatrixOn(false), [])
  const handleEngage        = useCallback(() => setCmdTrigger(t => t + 1), [])

  const handlePing = useCallback((target: string) => {
    setPingTarget(target)
    if (pingTimer.current) clearTimeout(pingTimer.current)
    pingTimer.current = setTimeout(() => setPingTarget(undefined), 3000)
  }, [])

  return (
    <main className="relative min-h-screen bg-vxo-void overflow-x-hidden">

      {phase === "terminal" && (
        <VXO_Terminal onComplete={handleTerminalDone} />
      )}

      {phase === "hud" && (
        <>
          <div className="fixed inset-0 z-0"><ThreeCanvas /></div>

          <div
            className="fixed inset-0 z-[1] pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, transparent 0%, #070b0f 70%)" }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col min-h-screen">
            <HUDHeader />
            <div className="flex-1 flex flex-col">
              <HeroSection onEngage={handleEngage} />
              <HUDGrid pingTarget={pingTarget} />
            </div>
            <HUDFooter />
          </div>

          <CommandPalette
            openTrigger={cmdTrigger}
            onMatrixTrigger={handleMatrixTrigger}
            onPing={handlePing}
          />

          {matrixOn && <MatrixRain onDismiss={handleMatrixDismiss} />}
        </>
      )}
    </main>
  )
}
