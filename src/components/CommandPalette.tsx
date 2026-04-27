"use client"

import {
  useEffect, useRef, useState, useCallback,
  KeyboardEvent, ChangeEvent,
} from "react"
import { gsap } from "gsap"

/* ── Command Registry ───────────────────────────────────────────── */
interface CmdResult {
  lines: Array<{ text: string; color?: string }>
  action?: "matrix" | "ping" | "clear"
  pingTarget?: string
}

type CommandFn = (args: string[]) => CmdResult

const COMMANDS: Record<string, { desc: string; fn: CommandFn }> = {
  help: {
    desc: "List all available commands",
    fn: () => ({
      lines: [
        { text: "┌─ AVAILABLE COMMANDS ──────────────────────┐", color: "text-vxo-border" },
        { text: "  help                  — this menu",          color: "text-slate-400"   },
        { text: "  whoami               — operator identity",  color: "text-slate-400"   },
        { text: "  ls /vxo              — list verticals",     color: "text-slate-400"   },
        { text: "  ping <section>        — highlight a sector", color: "text-slate-400"   },
        { text: "  status               — system status",      color: "text-slate-400"   },
        { text: "  clear                — clear console",      color: "text-slate-400"   },
        { text: "  sudo vxo --access    — [RESTRICTED]",       color: "text-vxo-amber"   },
        { text: "└───────────────────────────────────────────┘", color: "text-vxo-border" },
      ],
    }),
  },

  whoami: {
    desc: "Operator identity card",
    fn: () => ({
      lines: [
        { text: "╔══════════════════════════════╗",  color: "text-vxo-green/50"  },
        { text: "║  OPERATOR : VXO_PRIME        ║",  color: "text-vxo-green"     },
        { text: "║  CLASS    : Solutions Architect║", color: "text-slate-300"     },
        { text: "║  CLEARANCE: LEVEL 5           ║",  color: "text-vxo-cyan"      },
        { text: "║  NODE     : vxo.io            ║",  color: "text-slate-400"     },
        { text: "║  STATUS   : ACTIVE            ║",  color: "text-vxo-green"     },
        { text: "╚══════════════════════════════╝",  color: "text-vxo-green/50"  },
      ],
    }),
  },

  "ls": {
    desc: "List verticals",
    fn: (args) => {
      if (args[0] !== "/vxo" && args[0] !== undefined) {
        return { lines: [{ text: `ls: '${args[0]}': No such path`, color: "text-vxo-red" }] }
      }
      return {
        lines: [
          { text: "drwx——  [0x01]  CORE_ENGINE    Cloud-native automation at scale",   color: "text-vxo-green-d" },
          { text: "drwx——  [0x02]  NEURAL_ARCH    AI orchestration / LLM layers",      color: "text-vxo-cyan"    },
          { text: "drwx——  [0x03]  CYBER_INTEL    Browser automation & data harvest",  color: "text-vxo-amber"   },
          { text: "drwx——  [0x04]  COMMAND_CONTROL  VNC/CDP enterprise dashboards",    color: "text-vxo-green-d" },
        ],
      }
    },
  },

  ping: {
    desc: "Ping a sector",
    fn: (args) => {
      const target = args[0]?.toLowerCase()
      const valid  = ["core_engine", "neural_arch", "cyber_intel", "command_control", "0x01", "0x02", "0x03", "0x04"]
      if (!target) {
        return { lines: [{ text: "Usage: ping <section>", color: "text-vxo-amber" }] }
      }
      if (!valid.includes(target)) {
        return { lines: [{ text: `ping: unknown host '${target}'. Try: core_engine, neural_arch, cyber_intel, command_control`, color: "text-vxo-red" }] }
      }
      return {
        lines: [{ text: `PING ${target.toUpperCase()}... PONG  [12ms]`, color: "text-vxo-green" }],
        action: "ping",
        pingTarget: target,
      }
    },
  },

  status: {
    desc: "System status",
    fn: () => ({
      lines: [
        { text: "● CORE_ENGINE     ── ONLINE   100% uptime",  color: "text-vxo-green"   },
        { text: "● NEURAL_ARCH     ── ONLINE   99.8% uptime", color: "text-vxo-green"   },
        { text: "● CYBER_INTEL     ── ACTIVE   23 sessions",  color: "text-vxo-cyan"    },
        { text: "● COMMAND_CONTROL ── STAGING  deploy 14:32", color: "text-vxo-amber"   },
        { text: "  Entropy pool: HIGH  ⬡  Load: 0.34",        color: "text-slate-500"   },
      ],
    }),
  },

  clear: {
    desc: "Clear console",
    fn: () => ({ lines: [], action: "clear" }),
  },

  sudo: {
    desc: "Superuser command",
    fn: (args) => {
      if (args[0] === "vxo" && args[1] === "--access") {
        return {
          lines: [
            { text: "⚡ sudo: ROOT ACCESS GRANTED",          color: "text-vxo-green text-glow-green" },
            { text: "  Initiating deep-access protocol...", color: "text-vxo-amber"                  },
          ],
          action: "matrix",
        }
      }
      return { lines: [{ text: "sudo: permission denied", color: "text-vxo-red" }] }
    },
  },
}

/* ── History item ───────────────────────────────────────────────── */
interface HistoryItem {
  id:     number
  input:  string
  result: CmdResult
}

/* ── Command Palette ─────────────────────────────────────────────── */
export default function CommandPalette({
  openTrigger,
  onMatrixTrigger,
  onPing,
}: {
  openTrigger?:    number
  onMatrixTrigger?: () => void
  onPing?: (target: string) => void
}) {
  const [open,    setOpen]    = useState(false)
  const [value,   setValue]   = useState("")
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [hIdx,    setHIdx]    = useState(-1)
  const inputRef   = useRef<HTMLInputElement>(null)
  const bodyRef    = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  const idRef      = useRef(0)

  // ── Toggle open ─────────────────────────────────────────────────
  const close = useCallback(() => {
    setOpen(false)
    setValue("")
    setHIdx(-1)
  }, [])

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [close])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Open when triggered externally (e.g. "Engage Systems" button)
  useEffect(() => {
    if (openTrigger && openTrigger > 0) setOpen(true)
  }, [openTrigger])

  // Animate panel in/out with GSAP
  useEffect(() => {
    const backdrop = backdropRef.current
    const panel    = panelRef.current
    if (!backdrop || !panel) return

    if (open) {
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" })
      gsap.fromTo(panel,
        { opacity: 0, y: -16, scale: 0.97 },
        { opacity: 1, y: 0,   scale: 1,    duration: 0.2, ease: "power3.out" }
      )
    } else {
      gsap.to(panel,    { opacity: 0, y: -8, scale: 0.98, duration: 0.15, ease: "power3.in" })
      gsap.to(backdrop, { opacity: 0, duration: 0.15, ease: "none" })
    }
  }, [open])

  // Scroll to bottom on new history
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [history])

  // ── Execute command ──────────────────────────────────────────────
  const execute = useCallback((raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    const parts  = trimmed.toLowerCase().split(/\s+/)
    const cmd    = parts[0]
    const args   = parts.slice(1)
    const entry  = COMMANDS[cmd]
    const result = entry
      ? entry.fn(args)
      : { lines: [{ text: `command not found: '${cmd}'. Type 'help'.`, color: "text-vxo-red" }] }

    if (result.action === "clear") {
      setHistory([])
      setValue("")
      return
    }

    setHistory(h => [
      ...h,
      { id: ++idRef.current, input: trimmed, result },
    ])

    if (result.action === "matrix") {
      setTimeout(() => {
        close()
        onMatrixTrigger?.()
      }, 600)
    }

    if (result.action === "ping" && result.pingTarget) {
      onPing?.(result.pingTarget)
    }

    setValue("")
    setHIdx(-1)
  }, [close, onMatrixTrigger, onPing])

  // ── Input handlers ───────────────────────────────────────────────
  const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      execute(value)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const next = Math.min(hIdx + 1, history.length - 1)
      setHIdx(next)
      setValue(history[history.length - 1 - next]?.input ?? "")
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = Math.max(hIdx - 1, -1)
      setHIdx(next)
      setValue(next === -1 ? "" : history[history.length - 1 - next]?.input ?? "")
    } else if (e.key === "Tab") {
      e.preventDefault()
      const partial = value.trim().toLowerCase()
      const match   = Object.keys(COMMANDS).find(k => k.startsWith(partial))
      if (match) setValue(match + " ")
    }
  }, [execute, value, hIdx, history])

  return (
    <>
      {/* ── Hint pill (always visible) ─────────────────────────────── */}
      <button
        className="
          fixed bottom-6 right-6 z-40
          flex items-center gap-2
          px-3 py-1.5
          font-mono text-2xs text-vxo-green/70
          border border-vxo-green/20
          bg-vxo-surface/60 backdrop-blur-md
          hover:border-vxo-green/50 hover:text-vxo-green
          transition-all duration-200
        "
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
      >
        <span className="text-slate-600">⌘</span>
        <span>K</span>
        <span className="text-slate-600">—</span>
        <span>COMMAND</span>
      </button>

      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 bg-black/70 cmd-overlay"
        style={{ opacity: 0, pointerEvents: open ? "auto" : "none" }}
        onClick={close}
      />

      {/* ── Panel ────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className="
          fixed z-50
          top-[15vh] left-1/2
          w-full max-w-xl
          -translate-x-1/2
          border border-vxo-green/25
          bg-vxo-void/95 backdrop-blur-xl
          overflow-hidden
        "
        style={{
          boxShadow: "0 0 60px rgba(0,255,65,0.08), 0 24px 64px rgba(0,0,0,0.9)",
          opacity: 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-vxo-green/10">
          <span className="text-vxo-green text-xs font-mono">⬡</span>
          <span className="font-mono text-2xs text-slate-500 tracking-widest uppercase">
            VXO Command Interface
          </span>
          <span className="ml-auto font-mono text-2xs text-slate-700">ESC to close</span>
        </div>

        {/* History */}
        <div
          ref={bodyRef}
          className="px-4 py-3 max-h-64 overflow-y-auto space-y-3"
        >
          {history.length === 0 && (
            <p className="font-mono text-2xs text-slate-700">
              Type <span className="text-vxo-green">help</span> to get started.
            </p>
          )}
          {history.map(item => (
            <div key={item.id} className="space-y-0.5">
              <p className="font-mono text-xs text-slate-500">
                <span className="text-vxo-green/60">$</span> {item.input}
              </p>
              {item.result.lines.map((l, i) => (
                <p key={i} className={`font-mono text-xs leading-5 ${l.color ?? "text-slate-400"}`}>
                  {l.text}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-vxo-green/10">
          <span className="font-mono text-xs text-vxo-green flex-shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="enter command..."
            className="
              flex-1 bg-transparent border-none outline-none
              font-mono text-xs text-vxo-white
              placeholder:text-slate-700
              caret-vxo-green
            "
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
      </div>
    </>
  )
}
