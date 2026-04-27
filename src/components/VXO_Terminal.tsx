"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"

/* ── Boot sequence script ──────────────────────────────────────── */
interface BootLine {
  text: string
  delay: number        // ms before this line starts typing
  speed?: number       // ms per character (default 18)
  color?: string       // tailwind text class
  newline?: boolean    // extra blank line before
  instant?: boolean    // skip typing, appear at once
}

const BOOT_SCRIPT: BootLine[] = [
  { text: "VXO LABS — SECURE TERMINAL v4.2.0", delay: 0,    speed: 12, color: "text-vxo-green",  instant: true },
  { text: "────────────────────────────────────────────────────", delay: 80,  instant: true, color: "text-vxo-border" },
  { text: "",                                                  delay: 120, instant: true },
  { text: "Initializing kernel modules...",                   delay: 180, speed: 18, color: "text-slate-400" },
  { text: "  ✓ cryptographic libraries  [OK]",               delay: 520, speed: 14, color: "text-vxo-green-d" },
  { text: "  ✓ memory allocator         [OK]",               delay: 680, speed: 14, color: "text-vxo-green-d" },
  { text: "  ✓ entropy pool seeded      [OK]",               delay: 820, speed: 14, color: "text-vxo-green-d" },
  { text: "  ✓ secure channel           [ESTABLISHED]",      delay: 1000, speed: 14, color: "text-vxo-cyan" },
  { text: "",                                                  delay: 1100, instant: true },
  { text: "Verifying operator clearance level...",            delay: 1150, speed: 20, color: "text-slate-400", newline: true },
  // progress bar injected by component
  { text: "",                                                  delay: 2600, instant: true },
  { text: "  OPERATOR:   VXO_PRIME",                         delay: 2650, speed: 14, color: "text-vxo-amber" },
  { text: "  CLEARANCE:  LEVEL 5 — UNRESTRICTED",            delay: 2850, speed: 14, color: "text-vxo-green" },
  { text: "  AUTH_TOKEN: ****-****-****-[REDACTED]",         delay: 3050, speed: 14, color: "text-slate-500" },
  { text: "",                                                  delay: 3200, instant: true },
  { text: "  ■ ACCESS GRANTED.",                             delay: 3250, speed: 10, color: "text-vxo-green text-glow-green font-bold" },
  { text: "",                                                  delay: 3400, instant: true },
  { text: "Loading VXO interface...   [STAND BY]",           delay: 3450, speed: 16, color: "text-slate-500" },
]

/* ── Typewriter Hook ────────────────────────────────────────────── */
function useTypewriter(text: string, speed = 18, start = false) {
  const [output, setOutput] = useState("")

  useEffect(() => {
    if (!start) return
    setOutput("")
    let i = 0
    const iv = setInterval(() => {
      if (i >= text.length) { clearInterval(iv); return }
      setOutput(text.slice(0, i + 1))
      i++
    }, speed)
    return () => clearInterval(iv)
  }, [text, speed, start])

  return output
}

/* ── Progress Bar Component ─────────────────────────────────────── */
function ScanProgress({ start, onDone }: { start: boolean; onDone: () => void }) {
  const [pct, setPct] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    if (!start || done.current) return
    done.current = true
    let v = 0
    const iv = setInterval(() => {
      // Non-linear fill: fast → pause → sprint
      const step = v < 40 ? 3.5 : v < 75 ? 1.2 : v < 90 ? 2.8 : 4.0
      v = Math.min(100, v + step)
      setPct(v)
      if (v >= 100) { clearInterval(iv); setTimeout(onDone, 200) }
    }, 40)
    return () => clearInterval(iv)
  }, [start, onDone])

  const bar = "█".repeat(Math.floor(pct / 5)).padEnd(20, "░")
  const label = pct < 100 ? "SCANNING..." : "VERIFIED  "

  return (
    <div className="flex items-center gap-3 font-mono text-xs mt-1">
      <span className="text-slate-500 w-20">{label}</span>
      <span className="text-vxo-green">{bar}</span>
      <span className="text-vxo-cyan tabular-nums w-8">{Math.round(pct)}%</span>
    </div>
  )
}

/* ── Individual Terminal Line ───────────────────────────────────── */
interface LineProps {
  line: BootLine
  active: boolean
  onDone: () => void
}

function TerminalLine({ line, active, onDone }: LineProps) {
  const typed = useTypewriter(
    line.text,
    line.speed ?? 18,
    active && !line.instant
  )

  useEffect(() => {
    if (!active) return
    if (line.instant || line.text === "") {
      const t = setTimeout(onDone, line.instant ? 0 : 30)
      return () => clearTimeout(t)
    }
  }, [active, line, onDone])

  // Typewriter done
  useEffect(() => {
    if (!line.instant && typed === line.text && typed.length > 0) {
      setTimeout(onDone, 60)
    }
  }, [typed, line, onDone])

  const display = line.instant ? line.text : typed

  return (
    <p
      className={`font-mono text-xs leading-5 whitespace-pre ${line.color ?? "text-slate-400"} ${line.newline ? "mt-2" : ""}`}
    >
      {display}
      {!line.instant && active && typed !== line.text && (
        <span className="text-vxo-green animate-cursor-blink">█</span>
      )}
    </p>
  )
}

/* ── VXO_Terminal ────────────────────────────────────────────────── */
export interface VXOTerminalProps {
  onComplete: () => void
}

const PROGRESS_LINE_INDEX = 9  // index in BOOT_SCRIPT after which progress bar renders

export default function VXO_Terminal({ onComplete }: VXOTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef     = useRef<HTMLDivElement>(null)
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [activeIdx, setActiveIdx]       = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [progressDone, setProgressDone] = useState(false)
  const [done, setDone]                 = useState(false)

  // Sequentially reveal lines
  const handleLineDone = useCallback((idx: number) => {
    setVisibleLines(p => [...p, idx])

    if (idx === PROGRESS_LINE_INDEX - 1) {
      setShowProgress(true)
      return // progress bar handles its own completion
    }

    const next = idx + 1
    if (next < BOOT_SCRIPT.length) {
      const delay = BOOT_SCRIPT[next].delay - (BOOT_SCRIPT[idx].delay ?? 0)
      setTimeout(() => setActiveIdx(next), Math.max(0, delay))
    } else {
      setDone(true)
    }
  }, [])

  const handleProgressDone = useCallback(() => {
    setProgressDone(true)
    const next = PROGRESS_LINE_INDEX
    setTimeout(() => setActiveIdx(next), 300)
  }, [])

  // Trigger dissolve when boot sequence ends
  useEffect(() => {
    if (!done) return

    const tl = gsap.timeline({
      onComplete: () => onComplete(),
    })

    // Flicker the panel
    tl.to(panelRef.current, {
      duration: 0.06, opacity: 0.3, ease: "none",
    })
    .to(panelRef.current, { duration: 0.04, opacity: 1,   ease: "none" })
    .to(panelRef.current, { duration: 0.06, opacity: 0.2, ease: "none" })
    .to(panelRef.current, { duration: 0.04, opacity: 1,   ease: "none" })

    // Dissolve container upward
    .to(containerRef.current, {
      duration: 0.9,
      opacity: 0,
      y: -24,
      scale: 0.98,
      ease: "power3.in",
      delay: 0.3,
    })
  }, [done, onComplete])

  // Start the first line
  useEffect(() => {
    const delay = BOOT_SCRIPT[0].delay
    const t = setTimeout(() => setActiveIdx(0), delay)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-vxo-void"
    >
      {/* Ambient grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-2xl mx-4"
      >
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2 border border-vxo-green/20 border-b-0 bg-vxo-surface/60">
          <div className="w-2.5 h-2.5 rounded-full bg-vxo-red   shadow-glow-red"   />
          <div className="w-2.5 h-2.5 rounded-full bg-vxo-amber shadow-glow-amber" />
          <div className="w-2.5 h-2.5 rounded-full bg-vxo-green shadow-glow-green" />
          <span className="ml-auto font-mono text-2xs text-slate-600 tracking-widest uppercase">
            vxo@secure-terminal:~$
          </span>
        </div>

        {/* Terminal body */}
        <div
          className="
            relative px-6 py-5
            border border-vxo-green/20
            bg-vxo-void/95
            min-h-[360px]
            overflow-hidden
          "
          style={{ boxShadow: "0 0 80px rgba(0,255,65,0.05), inset 0 0 40px rgba(0,0,0,0.5)" }}
        >
          {/* Inner scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,65,0.5) 3px, rgba(0,255,65,0.5) 4px)",
            }}
            aria-hidden="true"
          />

          {/* Lines */}
          <div className="relative z-10 space-y-0.5">
            {BOOT_SCRIPT.map((line, i) => {
              const isActive  = activeIdx === i
              const isVisible = visibleLines.includes(i)

              // Skip lines not yet reached
              if (!isActive && !isVisible && i > activeIdx) return null

              return (
                <div key={i}>
                  <TerminalLine
                    line={line}
                    active={isActive}
                    onDone={() => handleLineDone(i)}
                  />
                  {/* Progress bar injected after line PROGRESS_LINE_INDEX - 1 */}
                  {i === PROGRESS_LINE_INDEX - 1 && showProgress && (
                    <div className="mt-1 mb-1">
                      <ScanProgress
                        start={showProgress}
                        onDone={handleProgressDone}
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Final cursor */}
            {done && (
              <p className="font-mono text-xs text-vxo-green mt-2">
                <span className="typewriter-cursor" />
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-1.5 border border-vxo-green/20 border-t-0 bg-vxo-surface/40">
          <span className="font-mono text-2xs text-slate-700">
            ENC: AES-256-GCM  |  TLS 1.3
          </span>
          <span className="font-mono text-2xs text-vxo-green/40 animate-pulse">
            ● SECURE
          </span>
        </div>

        {/* HUD corner decorations */}
        <div className="absolute top-0 left-0   w-4 h-4 border-t border-l border-vxo-green/60" />
        <div className="absolute top-0 right-0  w-4 h-4 border-t border-r border-vxo-green/60" />
        <div className="absolute bottom-0 left-0  w-4 h-4 border-b border-l border-vxo-green/60" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-vxo-green/60" />
      </div>
    </div>
  )
}
