"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { clsx } from "clsx"
import { gsap } from "gsap"

/* ── Types ───────────────────────────────────────────────────────── */
interface Sector {
  id:      string
  tag:     string
  title:   string
  sub:     string
  status:  string
  color:   "green" | "cyan" | "amber" | "purple"
  metric:  { base: number; unit: string; delta: number[] }
  logs:    string[]
  bullets: string[]
  tech:    string[]
  arch:    string
}

/* ── Colour tokens ───────────────────────────────────────────────── */
const C = {
  green: {
    border: "border-vxo-green/20 hover:border-vxo-green/60",
    tag:    "text-vxo-green",
    dot:    "bg-vxo-green",
    glow:   "hover:shadow-[0_0_40px_rgba(0,255,65,0.10)]",
    metric: "text-vxo-green",
    badge:  "border-vxo-green/25 text-vxo-green/75 bg-vxo-green/5",
    corner: "border-vxo-green/50",
    ring:   "ring-vxo-green/30",
  },
  cyan: {
    border: "border-vxo-cyan/20 hover:border-vxo-cyan/60",
    tag:    "text-vxo-cyan",
    dot:    "bg-vxo-cyan",
    glow:   "hover:shadow-[0_0_40px_rgba(0,212,255,0.10)]",
    metric: "text-vxo-cyan",
    badge:  "border-vxo-cyan/25 text-vxo-cyan/75 bg-vxo-cyan/5",
    corner: "border-vxo-cyan/50",
    ring:   "ring-vxo-cyan/30",
  },
  amber: {
    border: "border-vxo-amber/20 hover:border-vxo-amber/60",
    tag:    "text-vxo-amber",
    dot:    "bg-vxo-amber",
    glow:   "hover:shadow-[0_0_40px_rgba(255,176,0,0.10)]",
    metric: "text-vxo-amber",
    badge:  "border-vxo-amber/25 text-vxo-amber/75 bg-vxo-amber/5",
    corner: "border-vxo-amber/50",
    ring:   "ring-vxo-amber/30",
  },
  purple: {
    border: "border-purple-500/20 hover:border-purple-500/60",
    tag:    "text-purple-400",
    dot:    "bg-purple-500",
    glow:   "hover:shadow-[0_0_40px_rgba(124,58,237,0.12)]",
    metric: "text-purple-400",
    badge:  "border-purple-500/25 text-purple-400/75 bg-purple-500/5",
    corner: "border-purple-500/50",
    ring:   "ring-purple-500/30",
  },
}

/* ── Sector data ─────────────────────────────────────────────────── */
const SECTORS: Sector[] = [
  {
    id:     "SYS-01",
    tag:    "vxo/proxy",
    title:  "PROXY MESH",
    sub:    "Multi-provider LLM request router",
    status: "LIVE",
    color:  "green",
    metric: { base: 14382, unit: "req/hr", delta: [+147, +312, -89, +203, +178, -54, +290] },
    logs: [
      "→ claude-3-5-sonnet    47ms  [200]",
      "→ gpt-4o-mini          91ms  [200]",
      "CACHE HIT ─ saved 38ms",
      "→ gemini-1.5-pro       63ms  [200]",
      "ROUTE: cost-opt → claude-haiku",
      "→ claude-3-haiku       31ms  [200]",
      "FALLBACK: timeout → gemini",
      "RATE LIMIT: tenant-07 throttled",
      "→ gpt-4o               88ms  [200]",
      "CACHE MISS → forwarding",
    ],
    bullets: [
      "Routes across Claude, GPT-4o, Gemini with latency-aware selection",
      "Redis prompt cache — 34% cost reduction in production",
      "SSE streaming proxy with per-token billing ledger",
      "Per-tenant budget caps and hard rate limits",
    ],
    tech: ["Next.js Edge", "Redis", "Upstash", "TypeScript"],
    arch: `  CLIENT
    │
  ┌─▼──────────────────────┐
  │  EDGE PROXY (vxo/proxy) │
  │  cache lookup (Redis)   │
  └─┬──────────────────────┘
    │
  ┌─┼──────────────────────────┐
  │ ├─▶ claude-3-5-sonnet      │
  │ ├─▶ gpt-4o / mini          │ ranked by
  │ └─▶ gemini-1.5-pro         │ latency+cost
  └───────────────────────────┘
    │
  BILLING LEDGER → Postgres`,
  },
  {
    id:     "SYS-02",
    tag:    "vxo/fleet",
    title:  "PHANTOM FLEET",
    sub:    "Stealth browser automation at scale",
    status: "ACTIVE",
    color:  "cyan",
    metric: { base: 47, unit: "sessions", delta: [+3, -1, +2, +1, -2, +4, -1, +2] },
    logs: [
      "session-038 ─ target acquired",
      "session-012 ─ checkpoint bypassed",
      "FINGERPRINT rotated: pool-14",
      "session-051 ─ extraction done",
      "CAPTCHA solved ─ 94ms",
      "session-029 ─ proxy rotated",
      "HEALTH: 47/50 sessions alive",
      "session-003 ─ schema validated",
      "STEALTH: ua/canvas patched",
      "session-041 ─ queued for retry",
    ],
    bullets: [
      "CDP-native Playwright fleet with stealth patches applied",
      "Fingerprint rotation across 500+ concurrent sessions",
      "Anti-bot countermeasure research and live bypass",
      "Schema-validated structured extraction output",
    ],
    tech: ["Playwright", "CDP", "Python", "Rotating Proxies"],
    arch: `  TASK QUEUE (Redis)
    │
  ┌─▼──────────────────────┐
  │  FLEET MANAGER         │
  │  health monitor        │
  └─┬──────────────────────┘
    │
  ┌─┼── session-001        │
  │ ├── session-002    x50 │  Chromium +
  │ └── session-N          │  stealth CDP
  └───────────────────────┘
    │
  S3 / PostgreSQL ← results`,
  },
  {
    id:     "SYS-03",
    tag:    "vxo/forge",
    title:  "HELIX FORGE",
    sub:    "Zero-touch deployment pipeline",
    status: "ONLINE",
    color:  "amber",
    metric: { base: 99.97, unit: "% uptime", delta: [0, 0, +0.01, 0, -0.01, 0] },
    logs: [
      "deploy #4291 ─ ROLLED OUT",
      "health check ─ [OK] 3/3 pods",
      "replica 3 → 5 ─ scaling up",
      "rollback guard ─ ARMED",
      "cert renewal ─ 87d remaining",
      "drift scan ─ NO DELTA",
      "infra cost ─ $214/mo (-3%)",
      "secret rotation ─ COMPLETE",
      "canary: 10% traffic → v1.4.2",
      "smoke test ─ PASS 12/12",
    ],
    bullets: [
      "Kubernetes-native rollouts with zero-downtime blue-green strategy",
      "Terraform + Pulumi IaC across AWS, GCP, Hetzner",
      "ArgoCD GitOps — drift detection and auto-remediation",
      "Self-healing recovery with rollback guard and canary gates",
    ],
    tech: ["Kubernetes", "Terraform", "ArgoCD", "GitHub Actions"],
    arch: `  GitHub Push
    │
  ┌─▼──────────────────────┐
  │  ArgoCD (GitOps)        │
  │  drift detection        │
  └─┬──────────────────────┘
    │
  ┌─▼──────────────────────┐
  │  K8s Cluster            │
  │  blue ◄──── canary      │
  │  green   10%→100%       │
  └─┬──────────────────────┘
    │
  Datadog ← metrics / alerts`,
  },
  {
    id:     "SYS-04",
    tag:    "vxo/vektor",
    title:  "VEKTOR",
    sub:    "LLM-powered extraction & enrichment",
    status: "RUNNING",
    color:  "purple",
    metric: { base: 2318447, unit: "records/day", delta: [+8420, +12300, +5870, +9100, +7640] },
    logs: [
      "batch-0421 ─ 847 records parsed",
      "schema validation ─ PASS",
      "embedding ─ 1536-dim stored",
      "dedup ─ 23 collisions removed",
      "enrichment ─ geo + company",
      "batch-0422 ─ queued",
      "PG insert ─ 847 rows OK",
      "vector index ─ updated",
      "LLM extract ─ 14 fields",
      "confidence ─ avg 0.94",
    ],
    bullets: [
      "LLM-guided structured extraction with Pydantic schema validation",
      "1536-dim OpenAI embedding pipeline for semantic search",
      "Deduplication, geo-enrichment, and company resolution",
      "Streaming output to Postgres + pgvector for RAG",
    ],
    tech: ["Python", "Pydantic", "OpenAI", "pgvector"],
    arch: `  RAW SOURCE (HTML/JSON/PDF)
    │
  ┌─▼──────────────────────┐
  │  LLM EXTRACTOR          │
  │  GPT-4o + Pydantic      │
  └─┬──────────────────────┘
    │
  ┌─▼──────────────────────┐
  │  ENRICHMENT PIPELINE    │
  │  geo / company / dedup  │
  └─┬──────────────────────┘
    │
  Postgres + pgvector
  ← embeddings / full-text`,
  },
]

/* ── Live log ticker ─────────────────────────────────────────────── */
function LiveLog({ lines }: { lines: string[] }) {
  const [entries, setEntries] = useState<Array<{ k: number; t: string }>>([
    { k: 0, t: lines[0] },
  ])
  const ctr = useRef(1)
  const idx = useRef(1)

  useEffect(() => {
    const iv = setInterval(() => {
      const t = lines[idx.current % lines.length]
      idx.current++
      setEntries(prev => [...prev.slice(-2), { k: ctr.current++, t }])
    }, 1700 + Math.random() * 600)
    return () => clearInterval(iv)
  }, [lines])

  return (
    <div className="font-mono text-[0.58rem] mt-2 space-y-px overflow-hidden">
      {entries.map((e, i) => (
        <p key={e.k} className={i === entries.length - 1 ? "text-slate-500" : "text-slate-700 opacity-60"}>
          {e.t}
        </p>
      ))}
    </div>
  )
}

/* ── Live metric counter ─────────────────────────────────────────── */
function LiveMetric({ base, unit, delta }: { base: number; unit: string; delta: number[] }) {
  const [val, setVal] = useState(base)
  const idx = useRef(0)

  useEffect(() => {
    const iv = setInterval(() => {
      setVal(v => {
        const d = delta[idx.current++ % delta.length]
        return Math.max(0, parseFloat((v + d).toFixed(2)))
      })
    }, 2800 + Math.random() * 800)
    return () => clearInterval(iv)
  }, [delta])

  return (
    <>
      <span className="tabular-nums">{typeof val === "number" && val > 1000 ? val.toLocaleString() : val}</span>
      {" "}
      <span className="text-slate-600 font-normal">{unit}</span>
    </>
  )
}

/* ── Detail modal ────────────────────────────────────────────────── */
function SectorModal({ sector, onClose }: { sector: Sector; onClose: () => void }) {
  const c          = C[sector.color]
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)

  const animateOut = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, ease: "none" })
    gsap.to(panelRef.current,   { opacity: 0, y: 14, scale: 0.97, duration: 0.22, ease: "power3.in", onComplete: onClose })
  }, [onClose])

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" })
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 24, scale: 0.96 },
      { opacity: 1, y: 0,  scale: 1,   duration: 0.3, ease: "power3.out" }
    )
    const onEsc = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") animateOut() }
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [animateOut])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={animateOut}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={clsx(
          "relative w-full max-w-2xl max-h-[85vh] overflow-y-auto",
          "border bg-vxo-void/98",
          "hud-corners",
          c.border.split(" ")[0],
        )}
        style={{ boxShadow: "0 0 80px rgba(0,0,0,0.9), 0 0 40px rgba(0,255,65,0.05)" }}
      >
        {/* Header */}
        <div className={clsx("flex items-start justify-between p-5 border-b", c.border.split(" ")[0])}>
          <div>
            <div className={clsx("font-mono text-2xs tracking-[0.2em] uppercase mb-1", c.tag)}>
              [{sector.id}] {sector.tag}
            </div>
            <h2 className="font-mono text-lg font-bold text-vxo-white">{sector.title}</h2>
            <p className="font-sans text-sm text-slate-400 mt-0.5">{sector.sub}</p>
          </div>
          <button
            onClick={animateOut}
            className={clsx("font-mono text-2xs px-3 py-1.5 border transition-colors", c.border.split(" ")[0], c.tag, "hover:bg-white/5")}
          >
            × CLOSE
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Tech stack */}
          <div>
            <p className="font-mono text-2xs text-slate-600 tracking-widest uppercase mb-2">TECH STACK</p>
            <div className="flex flex-wrap gap-2">
              {sector.tech.map(t => (
                <span key={t} className={clsx("font-mono text-2xs px-2 py-0.5 border rounded-sm", c.badge)}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <p className="font-mono text-2xs text-slate-600 tracking-widest uppercase mb-2">CAPABILITIES</p>
            <ul className="space-y-1.5">
              {sector.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 font-mono text-xs text-slate-400">
                  <span className={clsx("mt-0.5 flex-shrink-0", c.tag)}>›</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Architecture */}
          <div>
            <p className="font-mono text-2xs text-slate-600 tracking-widest uppercase mb-2">ARCHITECTURE</p>
            <pre className={clsx("font-mono text-[0.65rem] leading-5 text-slate-500 border p-3 overflow-x-auto", c.border.split(" ")[0])}>
              {sector.arch}
            </pre>
          </div>

          {/* Live log */}
          <div>
            <p className="font-mono text-2xs text-slate-600 tracking-widest uppercase mb-2">LIVE LOG</p>
            <div className={clsx("border p-3 space-y-1", c.border.split(" ")[0])}>
              <ModalLiveLog lines={sector.logs} />
            </div>
          </div>

          {/* Metric */}
          <div className={clsx("border-t pt-4 flex items-center justify-between", c.border.split(" ")[0])}>
            <span className="font-mono text-2xs text-slate-600">LIVE METRIC</span>
            <span className={clsx("font-mono text-sm font-semibold", c.metric)}>
              <LiveMetric {...sector.metric} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Modal live log (shows more lines) ──────────────────────────── */
function ModalLiveLog({ lines }: { lines: string[] }) {
  const [entries, setEntries] = useState<Array<{ k: number; t: string }>>(
    lines.slice(0, 5).map((t, k) => ({ k, t }))
  )
  const ctr = useRef(lines.length)
  const idx = useRef(lines.length)

  useEffect(() => {
    const iv = setInterval(() => {
      const t = lines[idx.current % lines.length]
      idx.current++
      setEntries(prev => [...prev.slice(-6), { k: ctr.current++, t }])
    }, 1200 + Math.random() * 500)
    return () => clearInterval(iv)
  }, [lines])

  return (
    <>
      {entries.map((e, i) => (
        <p key={e.k} className={clsx("font-mono text-xs transition-opacity duration-300", i === entries.length - 1 ? "text-slate-400" : "text-slate-600")}>
          <span className="text-slate-700 select-none">{">"} </span>{e.t}
        </p>
      ))}
    </>
  )
}

/* ── Sector card ─────────────────────────────────────────────────── */
function SectorCard({
  sector,
  pinged,
  index,
  onSelect,
}: {
  sector:   Sector
  pinged:   boolean
  index:    number
  onSelect: () => void
}) {
  const c = C[sector.color]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelect()}
      className={clsx(
        "relative group hud-corners cursor-pointer select-none",
        "border bg-vxo-surface/50 backdrop-blur-sm",
        "transition-all duration-300",
        "p-5",
        "animate-sector-in",
        c.border,
        c.glow,
        pinged && "ring-1 ring-current animate-pulse-glow",
      )}
      style={{ animationDelay: `${0.12 * index}s` }}
    >
      {/* HUD corner overrides for card */}
      <div className={clsx("corner-br absolute bottom-0 right-0 w-3 h-3 border-b border-r", c.corner)} />
      <div className={clsx("corner-tl absolute bottom-0 left-0  w-3 h-3 border-b border-l", c.corner)} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className={clsx("font-mono text-2xs tracking-[0.2em] uppercase mb-1", c.tag)}>
            [{sector.id}] {sector.tag}
          </div>
          <h3 className="font-mono text-sm font-semibold text-vxo-white leading-tight">{sector.title}</h3>
          <p className="font-sans text-xs text-slate-500 mt-0.5">{sector.sub}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          <div className={clsx("w-1.5 h-1.5 rounded-full status-pulse", c.dot)} />
          <span className={clsx("font-mono text-2xs", c.tag)}>{sector.status}</span>
        </div>
      </div>

      {/* Divider */}
      <div className={clsx("h-px mb-3 opacity-20 bg-gradient-to-r from-transparent via-current to-transparent", c.tag)} />

      {/* Live log */}
      <LiveLog lines={sector.logs} />

      {/* Metric + inspect */}
      <div className={clsx("font-mono text-2xs border-t pt-3 mt-3 flex items-center justify-between", c.border.split(" ")[0])}>
        <span className={clsx("font-semibold", c.metric)}>
          <LiveMetric {...sector.metric} />
        </span>
        <span className={clsx("text-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-widest", c.tag)}>
          INSPECT →
        </span>
      </div>

      {/* Hover shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(0,255,65,0.02) 0%, transparent 60%)" }}
      />
    </div>
  )
}

/* ── HUD Grid export ─────────────────────────────────────────────── */
export default function HUDGrid({ pingTarget }: { pingTarget?: string }) {
  const [selected, setSelected] = useState<Sector | null>(null)

  return (
    <section
      className="relative z-10 w-full max-w-6xl mx-auto px-4 py-16"
      aria-label="VXO Labs systems"
    >
      <div className="flex items-center gap-4 mb-8">
        <span className="font-mono text-2xs text-vxo-green/50 tracking-[0.3em] uppercase">/VXO/SYSTEMS</span>
        <div className="flex-1 h-px bg-gradient-to-r from-vxo-green/20 to-transparent" />
        <span className="font-mono text-2xs text-slate-700">4 SYSTEMS ONLINE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTORS.map((s, i) => {
          const isPinged =
            pingTarget === s.id.toLowerCase() ||
            pingTarget === s.tag.toLowerCase().replace("vxo/", "")
          return (
            <SectorCard
              key={s.id}
              sector={s}
              pinged={isPinged}
              index={i}
              onSelect={() => setSelected(s)}
            />
          )
        })}
      </div>

      {selected && (
        <SectorModal sector={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}
