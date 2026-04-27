"use client"

import { useState, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { AnimatePresence, motion } from "motion/react"
import VXO_Terminal from "@/components/VXO_Terminal"
import HUDGrid      from "@/components/HUD/SectorPanel"
import CommandPalette from "@/components/CommandPalette"

/* ── Dynamic imports (SSR-unsafe) ────────────────────────────────── */
const ThreeCanvas = dynamic(() => import("@/components/ThreeCanvas"), {
  ssr: false,
  loading: () => null,
})

const MatrixRain = dynamic(() => import("@/components/MatrixRain"), {
  ssr: false,
})

/* ── Page phases ──────────────────────────────────────────────────── */
type Phase = "terminal" | "hud"

/* ── HUD Header bar ───────────────────────────────────────────────── */
function HUDHeader() {
  const now = new Date()
  const ts  = now.toISOString().replace("T", " ").slice(0, 19) + " UTC"

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="
        fixed top-0 inset-x-0 z-30
        flex items-center justify-between
        px-6 py-2
        border-b border-vxo-green/10
        bg-vxo-void/80 backdrop-blur-md
      "
    >
      {/* Left — wordmark */}
      <div className="flex items-center gap-3">
        <span className="text-vxo-green text-xs font-mono">⬡</span>
        <span className="font-mono text-sm font-semibold tracking-[0.18em] text-vxo-white uppercase">
          VXO Labs
        </span>
        <span className="font-mono text-2xs text-slate-700 tracking-widest hidden sm:inline">
          / Systems &amp; Intelligence
        </span>
      </div>

      {/* Right — status cluster */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-2xs text-slate-700 hidden md:inline tabular-nums">
          {ts}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-vxo-green status-pulse" />
          <span className="font-mono text-2xs text-vxo-green/70">ONLINE</span>
        </div>
      </div>
    </motion.header>
  )
}

/* ── Hero copy ────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="
        relative z-10 w-full max-w-6xl mx-auto
        px-4 pt-32 pb-4
        flex flex-col items-start
      "
    >
      {/* Tag */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex items-center gap-3 mb-6"
      >
        <span className="font-mono text-2xs text-vxo-green/50 tracking-[0.3em] uppercase">
          /VXO/INIT
        </span>
        <div className="h-px w-16 bg-vxo-green/20" />
        <span className="font-mono text-2xs text-slate-700">
          BUILD 2025.1
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="font-mono font-bold leading-none mb-4"
      >
        <span className="block text-4xl sm:text-6xl lg:text-7xl text-vxo-white">
          INFRASTRUCTURE
        </span>
        <span className="block text-4xl sm:text-6xl lg:text-7xl text-vxo-green text-glow-green">
          AT MACHINE SPEED.
        </span>
      </motion.h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.65 }}
        className="font-sans text-base text-slate-400 max-w-xl mb-8"
      >
        Cloud-native automation, AI orchestration, and adversarial intelligence
        — engineered for zero-downtime at global scale.
      </motion.p>

      {/* CTA row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex items-center gap-4 flex-wrap"
      >
        <button className="
          font-mono text-xs px-5 py-2.5
          border border-vxo-green/50
          bg-vxo-green/5
          text-vxo-green
          hover:bg-vxo-green/10 hover:border-vxo-green
          hover:shadow-[0_0_24px_rgba(0,255,65,0.12)]
          transition-all duration-200
        ">
          ENGAGE SYSTEMS
        </button>
        <span className="font-mono text-2xs text-slate-600">
          or press <kbd className="text-vxo-green">⌘K</kbd> to access terminal
        </span>
      </motion.div>
    </motion.section>
  )
}

/* ── Footer bar ───────────────────────────────────────────────────── */
function HUDFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="
        relative z-10 w-full
        border-t border-vxo-green/10
        px-6 py-3
        flex items-center justify-between
        bg-vxo-void/60 backdrop-blur-sm
      "
    >
      <span className="font-mono text-2xs text-slate-700">
        © 2025 VXO Labs — All rights reserved
      </span>
      <div className="flex items-center gap-4">
        <span className="font-mono text-2xs text-slate-700 hidden sm:inline">
          ENC: TLS 1.3
        </span>
        <span className="font-mono text-2xs text-slate-700 hidden sm:inline">|</span>
        <span className="font-mono text-2xs text-vxo-green/40 animate-pulse">
          ● SECURE
        </span>
      </div>
    </motion.footer>
  )
}

/* ── Root page ────────────────────────────────────────────────────── */
export default function Page() {
  const [phase,       setPhase]       = useState<Phase>("terminal")
  const [matrixOn,   setMatrixOn]    = useState(false)
  const [pingTarget, setPingTarget]  = useState<string | undefined>()
  const pingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTerminalDone = useCallback(() => {
    setPhase("hud")
  }, [])

  const handleMatrixTrigger = useCallback(() => {
    setMatrixOn(true)
  }, [])

  const handleMatrixDismiss = useCallback(() => {
    setMatrixOn(false)
  }, [])

  const handlePing = useCallback((target: string) => {
    setPingTarget(target)
    if (pingTimer.current) clearTimeout(pingTimer.current)
    pingTimer.current = setTimeout(() => setPingTarget(undefined), 3000)
  }, [])

  return (
    <main className="relative min-h-screen bg-vxo-void overflow-x-hidden">

      {/* ── Phase: Terminal boot ───────────────────────────────────── */}
      <AnimatePresence>
        {phase === "terminal" && (
          <VXO_Terminal onComplete={handleTerminalDone} />
        )}
      </AnimatePresence>

      {/* ── Phase: HUD ────────────────────────────────────────────── */}
      {phase === "hud" && (
        <>
          {/* 3D background — full viewport, behind everything */}
          <div className="fixed inset-0 z-0">
            <ThreeCanvas />
          </div>

          {/* Gradient vignette over canvas */}
          <div
            className="fixed inset-0 z-[1] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 100%, transparent 0%, #070b0f 70%)",
            }}
            aria-hidden="true"
          />

          {/* ── HUD Layer ─────────────────────────────────────────── */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <HUDHeader />

            <div className="flex-1 flex flex-col">
              <HeroSection />
              <HUDGrid pingTarget={pingTarget} />
            </div>

            <HUDFooter />
          </div>

          {/* ── Command Palette ─────────────────────────────────────── */}
          <CommandPalette
            onMatrixTrigger={handleMatrixTrigger}
            onPing={handlePing}
          />

          {/* ── Matrix Rain overlay ──────────────────────────────────── */}
          <AnimatePresence>
            {matrixOn && (
              <MatrixRain onDismiss={handleMatrixDismiss} />
            )}
          </AnimatePresence>
        </>
      )}
    </main>
  )
}
