"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

/* ── Boot sequence script ──────────────────────────────────────── */
interface BootLine {
  text:     string
  delay:    number        // gap hint used to compute inter-line spacing
  speed?:   number        // ms per character (default 18)
  color?:   string
  newline?: boolean
  instant?: boolean
}

const BOOT_SCRIPT: BootLine[] = [
  { text: "VXO LABS — SECURE TERMINAL v4.2.0",            delay: 0,    speed: 12, color: "text-vxo-green",  instant: true },
  { text: "────────────────────────────────────────────────────", delay: 80,  instant: true, color: "text-vxo-border" },
  { text: "",                                              delay: 120,  instant: true },
  { text: "Initializing kernel modules...",                delay: 180,  speed: 18, color: "text-slate-400" },
  { text: "  ✓ cryptographic libraries  [OK]",            delay: 520,  speed: 14, color: "text-vxo-green-d" },
  { text: "  ✓ memory allocator         [OK]",            delay: 680,  speed: 14, color: "text-vxo-green-d" },
  { text: "  ✓ entropy pool seeded      [OK]",            delay: 820,  speed: 14, color: "text-vxo-green-d" },
  { text: "  ✓ secure channel           [ESTABLISHED]",   delay: 1000, speed: 14, color: "text-vxo-cyan" },
  { text: "",                                              delay: 1100, instant: true },
  { text: "Verifying operator clearance level...",         delay: 1150, speed: 20, color: "text-slate-400", newline: true },
  { text: "",                                              delay: 2600, instant: true },
  { text: "  OPERATOR:   VXO_PRIME",                      delay: 2650, speed: 14, color: "text-vxo-amber" },
  { text: "  CLEARANCE:  LEVEL 5 — UNRESTRICTED",         delay: 2850, speed: 14, color: "text-vxo-green" },
  { text: "  AUTH_TOKEN: ****-****-****-[REDACTED]",      delay: 3050, speed: 14, color: "text-slate-500" },
  { text: "",                                              delay: 3200, instant: true },
  { text: "  ■ ACCESS GRANTED.",                          delay: 3250, speed: 10, color: "text-vxo-green text-glow-green font-bold" },
  { text: "",                                              delay: 3400, instant: true },
  { text: "Loading VXO interface...   [STAND BY]",        delay: 3450, speed: 16, color: "text-slate-500" },
]

// Index after which the progress bar is injected
const PROGRESS_IDX = 9

/* ── Compute absolute start time for each line ──────────────────── *
 * Typing time is derived from character count so every line is
 * guaranteed to finish before the next one begins.
 * ─────────────────────────────────────────────────────────────── */
function buildSchedule(): number[] {
  const starts: number[] = []
  let t = 0
  for (let i = 0; i < BOOT_SCRIPT.length; i++) {
    starts[i] = t
    const line = BOOT_SCRIPT[i]
    const gap  = i + 1 < BOOT_SCRIPT.length
      ? Math.max(20, BOOT_SCRIPT[i + 1].delay - line.delay)
      : 400

    if (line.instant || line.text === "") {
      t += gap
    } else {
      // typing duration + small settle gap + inter-line gap
      t += line.text.length * (line.speed ?? 18) + 80 + gap
    }

    // Insert progress-bar pause after the clearance-scan prompt (idx 9)
    if (i === PROGRESS_IDX - 1) {
      t += 1650  // ~1.5 s for bar to fill + 200 ms settle
    }
  }
  return starts
}

const SCHEDULE = buildSchedule()

/* ── Typewriter hook ─────────────────────────────────────────────── */
function useTypewriter(text: string, speed: number, active: boolean) {
  const [output, setOutput] = useState("")

  useEffect(() => {
    if (!active) { setOutput(""); return }
    let i = 0
    const iv = setInterval(() => {
      i++
      setOutput(text.slice(0, i))
      if (i >= text.length) clearInterval(iv)
    }, speed)
    return () => clearInterval(iv)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])   // only restarts when line becomes active — text/speed are stable per line

  return output
}

/* ── Progress bar ───────────────────────────────────────────────── */
function ScanProgress({ visible }: { visible: boolean }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    if (!visible) return
    let v = 0
    const iv = setInterval(() => {
      const step = v < 40 ? 3.5 : v < 75 ? 1.2 : v < 90 ? 2.8 : 4.0
      v = Math.min(100, v + step)
      setPct(v)
      if (v >= 100) clearInterval(iv)
    }, 40)
    return () => clearInterval(iv)
  }, [visible])

  const bar   = "█".repeat(Math.floor(pct / 5)).padEnd(20, "░")
  const label = pct < 100 ? "SCANNING..." : "VERIFIED  "

  return (
    <div className="flex items-center gap-3 font-mono text-xs mt-1">
      <span className="text-slate-500 w-20">{label}</span>
      <span className="text-vxo-green">{bar}</span>
      <span className="text-vxo-cyan tabular-nums w-8">{Math.round(pct)}%</span>
    </div>
  )
}

/* ── Individual line ─────────────────────────────────────────────── */
function TerminalLine({ line, active }: { line: BootLine; active: boolean }) {
  const typed   = useTypewriter(line.text, line.speed ?? 18, active && !line.instant)
  const display = line.instant ? line.text : typed

  return (
    <p className={`font-mono text-xs leading-5 whitespace-pre ${line.color ?? "text-slate-400"} ${line.newline ? "mt-2" : ""}`}>
      {display}
      {!line.instant && active && typed.length < line.text.length && (
        <span className="text-vxo-green animate-cursor-blink">█</span>
      )}
    </p>
  )
}

/* ── VXO_Terminal ────────────────────────────────────────────────── */
export interface VXOTerminalProps {
  onComplete: () => void
}

export default function VXO_Terminal({ onComplete }: VXOTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef     = useRef<HTMLDivElement>(null)

  // activeIdx: which line is currently typing (-1 = nothing yet)
  const [activeIdx,    setActiveIdx]    = useState(-1)
  const [showProgress, setShowProgress] = useState(false)
  const [done,         setDone]         = useState(false)

  /* Single imperative scheduler — no child callbacks, no cascading */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    SCHEDULE.forEach((startMs, i) => {
      timers.push(setTimeout(() => setActiveIdx(i), startMs))
    })

    // Show progress bar when clearance prompt becomes active
    timers.push(
      setTimeout(() => setShowProgress(true), SCHEDULE[PROGRESS_IDX - 1] + 120)
    )

    // Mark sequence done 400 ms after last line starts
    const lastStart = SCHEDULE[SCHEDULE.length - 1]
    const lastLine  = BOOT_SCRIPT[BOOT_SCRIPT.length - 1]
    const lastTypingMs = lastLine.text.length * (lastLine.speed ?? 18) + 200
    timers.push(setTimeout(() => setDone(true), lastStart + lastTypingMs))

    return () => timers.forEach(clearTimeout)
  }, [])

  /* Dissolve animation when sequence ends */
  useEffect(() => {
    if (!done) return
    const tl = gsap.timeline({ onComplete: onComplete })
    tl.to(panelRef.current, { duration: 0.06, opacity: 0.3, ease: "none" })
      .to(panelRef.current, { duration: 0.04, opacity: 1,   ease: "none" })
      .to(panelRef.current, { duration: 0.06, opacity: 0.2, ease: "none" })
      .to(panelRef.current, { duration: 0.04, opacity: 1,   ease: "none" })
      .to(containerRef.current, { duration: 0.9, opacity: 0, y: -24, scale: 0.98, ease: "power3.in", delay: 0.3 })
  }, [done, onComplete])

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-vxo-void">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div ref={panelRef} className="relative w-full max-w-2xl mx-4">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2 border border-vxo-green/20 border-b-0 bg-vxo-surface/60">
          <div className="w-2.5 h-2.5 rounded-full bg-vxo-red   shadow-glow-red"   />
          <div className="w-2.5 h-2.5 rounded-full bg-vxo-amber shadow-glow-amber" />
          <div className="w-2.5 h-2.5 rounded-full bg-vxo-green shadow-glow-green" />
          <span className="ml-auto font-mono text-2xs text-slate-600 tracking-widest uppercase">
            vxo@secure-terminal:~$
          </span>
        </div>

        {/* Body */}
        <div
          className="relative px-6 py-5 border border-vxo-green/20 bg-vxo-void/95 min-h-[360px] overflow-hidden"
          style={{ boxShadow: "0 0 80px rgba(0,255,65,0.05), inset 0 0 40px rgba(0,0,0,0.5)" }}
        >
          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,65,0.5) 3px, rgba(0,255,65,0.5) 4px)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-0.5">
            {BOOT_SCRIPT.map((line, i) => {
              if (activeIdx < i) return null
              return (
                <div key={i}>
                  <TerminalLine line={line} active={activeIdx === i} />
                  {i === PROGRESS_IDX - 1 && (
                    <div className="mt-1 mb-1">
                      <ScanProgress visible={showProgress} />
                    </div>
                  )}
                </div>
              )
            })}

            {done && (
              <p className="font-mono text-xs text-vxo-green mt-2">
                <span className="typewriter-cursor" />
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-1.5 border border-vxo-green/20 border-t-0 bg-vxo-surface/40">
          <span className="font-mono text-2xs text-slate-700">ENC: AES-256-GCM  |  TLS 1.3</span>
          <span className="font-mono text-2xs text-vxo-green/40 animate-pulse">● SECURE</span>
        </div>

        {/* Corner marks */}
        <div className="absolute top-0 left-0   w-4 h-4 border-t border-l border-vxo-green/60" />
        <div className="absolute top-0 right-0  w-4 h-4 border-t border-r border-vxo-green/60" />
        <div className="absolute bottom-0 left-0  w-4 h-4 border-b border-l border-vxo-green/60" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-vxo-green/60" />
      </div>
    </div>
  )
}
