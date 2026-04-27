"use client"

import { clsx } from "clsx"

export type SectorId = "0x01" | "0x02" | "0x03" | "0x04"

interface SectorConfig {
  id:      SectorId
  tag:     string
  title:   string
  sub:     string
  status:  string
  color:   "green" | "cyan" | "amber" | "purple"
  bullets: string[]
  metric:  { label: string; value: string }
}

const COLOR_MAP = {
  green:  {
    border:  "border-vxo-green/20  hover:border-vxo-green/50",
    tag:     "text-vxo-green",
    status:  "bg-vxo-green",
    corner:  "border-vxo-green/50",
    glow:    "hover:shadow-[0_0_32px_rgba(0,255,65,0.08)]",
    metric:  "text-vxo-green",
    bullet:  "text-vxo-green-d",
  },
  cyan:   {
    border:  "border-vxo-cyan/20   hover:border-vxo-cyan/50",
    tag:     "text-vxo-cyan",
    status:  "bg-vxo-cyan",
    corner:  "border-vxo-cyan/50",
    glow:    "hover:shadow-[0_0_32px_rgba(0,212,255,0.08)]",
    metric:  "text-vxo-cyan",
    bullet:  "text-vxo-cyan-d",
  },
  amber:  {
    border:  "border-vxo-amber/20  hover:border-vxo-amber/50",
    tag:     "text-vxo-amber",
    status:  "bg-vxo-amber",
    corner:  "border-vxo-amber/50",
    glow:    "hover:shadow-[0_0_32px_rgba(255,176,0,0.08)]",
    metric:  "text-vxo-amber",
    bullet:  "text-yellow-600",
  },
  purple: {
    border:  "border-purple-500/20 hover:border-purple-500/50",
    tag:     "text-purple-400",
    status:  "bg-purple-500",
    corner:  "border-purple-500/50",
    glow:    "hover:shadow-[0_0_32px_rgba(124,58,237,0.1)]",
    metric:  "text-purple-400",
    bullet:  "text-purple-500",
  },
}

function SectorPanel({
  sector,
  pinged,
  index,
}: {
  sector:  SectorConfig
  pinged:  boolean
  index:   number
}) {
  const c = COLOR_MAP[sector.color]

  return (
    <div
      className={clsx(
        "relative group hud-corners cursor-default select-none",
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
      {/* HUD corner marks */}
      <div className={clsx("corner-br absolute bottom-0 right-0 w-3 h-3 border-b border-r", c.corner)} />
      <div className={clsx("corner-tl absolute bottom-0 left-0  w-3 h-3 border-b border-l", c.corner)} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={clsx("font-mono text-2xs tracking-[0.2em] uppercase mb-1", c.tag)}>
            [{sector.id}] {sector.tag}
          </div>
          <h3 className="font-mono text-sm font-semibold text-vxo-white leading-tight">
            {sector.title}
          </h3>
          <p className="font-sans text-xs text-slate-500 mt-0.5">{sector.sub}</p>
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          <div className={clsx("w-1.5 h-1.5 rounded-full status-pulse", c.status)} />
          <span className={clsx("font-mono text-2xs", c.tag)}>{sector.status}</span>
        </div>
      </div>

      {/* Divider */}
      <div className={clsx("h-px mb-4 opacity-20", `bg-gradient-to-r from-transparent via-current to-transparent`, c.tag)} />

      {/* Bullets */}
      <ul className="space-y-1.5 mb-4">
        {sector.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 font-mono text-2xs text-slate-400">
            <span className={clsx("mt-0.5 flex-shrink-0", c.bullet)}>›</span>
            {b}
          </li>
        ))}
      </ul>

      {/* Metric strip */}
      <div className={clsx("font-mono text-2xs border-t pt-3 flex items-center justify-between", c.border.split(" ")[0])}>
        <span className="text-slate-600">{sector.metric.label}</span>
        <span className={clsx("font-semibold", c.metric)}>{sector.metric.value}</span>
      </div>

      {/* Hover shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(0,255,65,0.02) 0%, transparent 60%)",
        }}
      />
    </div>
  )
}

/* ── SECTOR DATA ─────────────────────────────────────────────────── */
const SECTORS: SectorConfig[] = [
  {
    id:     "0x01",
    tag:    "CORE_ENGINE",
    title:  "/VXO/CORE ENGINE",
    sub:    "Cloud-native automation and infrastructure at scale",
    status: "ONLINE",
    color:  "green",
    bullets: [
      "Kubernetes-native task orchestration with zero-downtime rollouts",
      "Multi-cloud IaC pipelines (Terraform + Pulumi) across 6 providers",
      "Event-driven microservice meshes with adaptive rate-shaping",
      "99.97% SLA with self-healing recovery loops",
    ],
    metric: { label: "SLA Uptime", value: "99.97%" },
  },
  {
    id:     "0x02",
    tag:    "NEURAL_ARCH",
    title:  "/VXO/NEURAL ARCH",
    sub:    "AI orchestration and LLM integration layers",
    status: "ONLINE",
    color:  "cyan",
    bullets: [
      "Multi-provider LLM routing with cost-aware fallback chains",
      "Streaming inference proxies and prompt caching at edge",
      "Autonomous agent frameworks with tool-calling and memory",
      "Embedding pipelines for retrieval-augmented generation",
    ],
    metric: { label: "Avg latency", value: "< 80ms" },
  },
  {
    id:     "0x03",
    tag:    "CYBER_INTEL",
    title:  "/VXO/CYBER INTEL",
    sub:    "Stealth automation, browser control, and data harvesting",
    status: "ACTIVE",
    color:  "amber",
    bullets: [
      "CDP-native browser orchestration at 500+ concurrent sessions",
      "Fingerprint-evasive automation with stealth Playwright patches",
      "Structured data extraction with schema-validated pipelines",
      "Anti-bot countermeasure analysis and bypass research",
    ],
    metric: { label: "Active sessions", value: "512 cap" },
  },
  {
    id:     "0x04",
    tag:    "COMMAND_CONTROL",
    title:  "/VXO/COMMAND CONTROL",
    sub:    "Private enterprise dashboards and VNC/CDP orchestration",
    status: "STAGING",
    color:  "purple",
    bullets: [
      "Real-time WebSocket screencast streaming over WebRTC",
      "Multi-tenant admin HUD with JWT-hardened session control",
      "VNC proxying layer with frame-differential compression",
      "Audit-trail recording with atomic transcript flushes",
    ],
    metric: { label: "Deploy queue", value: "Build 14:32" },
  },
]

/* ── HUD Grid export ─────────────────────────────────────────────── */
export default function HUDGrid({
  pingTarget,
}: {
  pingTarget?: string
}) {
  return (
    <section
      className="relative z-10 w-full max-w-6xl mx-auto px-4 py-16"
      aria-label="VXO Labs verticals"
    >
      {/* Section label */}
      <div className="flex items-center gap-4 mb-8">
        <span className="font-mono text-2xs text-vxo-green/50 tracking-[0.3em] uppercase">
          /VXO/VERTICALS
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-vxo-green/20 to-transparent" />
        <span className="font-mono text-2xs text-slate-700">
          4 SECTORS DETECTED
        </span>
      </div>

      {/* 2×2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTORS.map((s, i) => {
          const isPinged =
            pingTarget === s.id.toLowerCase() ||
            pingTarget === s.tag.toLowerCase()
          return (
            <SectorPanel key={s.id} sector={s} pinged={isPinged} index={i} />
          )
        })}
      </div>
    </section>
  )
}
