import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Core VXO Palette ────────────────────────────────────────
        "vxo-void":    "#070b0f",   // deepest background
        "vxo-bg":      "#0d1117",   // primary surface
        "vxo-surface": "#111827",   // card / panel base
        "vxo-border":  "#1f2937",   // subtle borders

        // ── Neon Accents ─────────────────────────────────────────────
        "vxo-green":   "#00ff41",   // poison-green primary
        "vxo-green-d": "#00cc33",   // dimmed green (text)
        "vxo-green-x": "#00ff88",   // bright variant
        "vxo-cyan":    "#00d4ff",   // cyan trace
        "vxo-cyan-d":  "#0099cc",   // dimmed cyan
        "vxo-amber":   "#ffb000",   // warning / highlight
        "vxo-red":     "#ff003c",   // alert / danger
        "vxo-purple":  "#7c3aed",   // neural / AI accent
        "vxo-white":   "#e2e8f0",   // body text

        // ── Glass ────────────────────────────────────────────────────
        "glass-10":    "rgba(0, 255, 65,  0.05)",
        "glass-20":    "rgba(0, 255, 65,  0.10)",
        "glass-border":"rgba(0, 255, 65,  0.15)",
      },

      fontFamily: {
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "Fira Code", "monospace"],
        sans: ["var(--font-inter)",      "Inter",          "system-ui",  "sans-serif"],
      },

      fontSize: {
        "2xs": ["0.65rem",  { lineHeight: "1rem"  }],
        "3xs": ["0.55rem",  { lineHeight: "0.8rem"}],
      },

      // ── Glow Box Shadows ─────────────────────────────────────────
      boxShadow: {
        "glow-green":  "0 0 8px #00ff41, 0 0 24px rgba(0,255,65,0.4)",
        "glow-green-l":"0 0 16px #00ff41, 0 0 48px rgba(0,255,65,0.25)",
        "glow-cyan":   "0 0 8px #00d4ff, 0 0 24px rgba(0,212,255,0.4)",
        "glow-amber":  "0 0 8px #ffb000, 0 0 24px rgba(255,176,0,0.4)",
        "glow-red":    "0 0 8px #ff003c, 0 0 24px rgba(255,0,60,0.4)",
        "panel":       "inset 0 1px 0 rgba(0,255,65,0.08), 0 4px 24px rgba(0,0,0,0.8)",
        "panel-hover": "inset 0 1px 0 rgba(0,255,65,0.15), 0 8px 48px rgba(0,0,0,0.9), 0 0 32px rgba(0,255,65,0.08)",
      },

      // ── Drop Shadows (filter) ─────────────────────────────────────
      dropShadow: {
        "green":  ["0 0 6px rgba(0,255,65,0.9)",  "0 0 20px rgba(0,255,65,0.5)"],
        "cyan":   ["0 0 6px rgba(0,212,255,0.9)", "0 0 20px rgba(0,212,255,0.5)"],
        "amber":  ["0 0 6px rgba(255,176,0,0.9)", "0 0 20px rgba(255,176,0,0.5)"],
      },

      // ── Keyframe Animations ───────────────────────────────────────
      keyframes: {
        flicker: {
          "0%, 100%":  { opacity: "1"   },
          "50%":       { opacity: "0.92"},
          "55%":       { opacity: "0.98"},
          "60%":       { opacity: "0.88"},
          "65%":       { opacity: "1"   },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px #00ff41, 0 0 24px rgba(0,255,65,0.3)"  },
          "50%":      { boxShadow: "0 0 16px #00ff41, 0 0 48px rgba(0,255,65,0.6)" },
        },
        "scan-line": {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "matrix-char": {
          "0%":   { opacity: "1", filter: "brightness(2)"   },
          "50%":  { opacity: "0.7"                          },
          "100%": { opacity: "0.15", filter: "brightness(1)" },
        },
        "cursor-blink": {
          "0%, 100%": { opacity: "1"  },
          "50%":      { opacity: "0"  },
        },
        "bracket-in": {
          "0%":   { width: "0", opacity: "0"   },
          "100%": { width: "12px", opacity: "1" },
        },
        "slide-up": {
          "0%":   { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)",   opacity: "1" },
        },
        "glitch-h": {
          "0%, 100%": { clipPath: "inset(0 0 100% 0)", transform: "translate(0)"        },
          "10%":      { clipPath: "inset(20% 0 60% 0)", transform: "translate(-2px, 1px)" },
          "20%":      { clipPath: "inset(60% 0 10% 0)", transform: "translate(2px, -1px)" },
          "30%":      { clipPath: "inset(40% 0 40% 0)", transform: "translate(-1px)"    },
          "40%":      { clipPath: "inset(0 0 0 0)",     transform: "translate(0)"       },
        },
        "hud-in": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)"    },
        },
        "sector-in": {
          "0%":   { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)"    },
        },
      },

      animation: {
        "flicker":      "flicker 4s ease-in-out infinite",
        "pulse-glow":   "pulse-glow 2.5s ease-in-out infinite",
        "scan-line":    "scan-line 6s linear infinite",
        "cursor-blink": "cursor-blink 1.1s step-end infinite",
        "bracket-in":   "bracket-in 0.3s ease-out forwards",
        "slide-up":     "slide-up 0.4s ease-out forwards",
        "glitch-h":     "glitch-h 0.4s steps(1) forwards",
        "hud-in":       "hud-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "sector-in":    "sector-in 0.55s cubic-bezier(0.16,1,0.3,1) both",
      },

      backdropBlur: {
        xs: "2px",
      },

      // ── Grid ─────────────────────────────────────────────────────
      gridTemplateColumns: {
        "hud-2": "1fr 1fr",
        "hud-3": "1fr 1.2fr 1fr",
      },

      transitionTimingFunction: {
        "cyber": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [
    // Glow text-shadow utility plugin
    function({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        ".text-glow-green": {
          textShadow: "0 0 8px #00ff41, 0 0 20px rgba(0,255,65,0.6)",
        },
        ".text-glow-cyan": {
          textShadow: "0 0 8px #00d4ff, 0 0 20px rgba(0,212,255,0.6)",
        },
        ".text-glow-amber": {
          textShadow: "0 0 8px #ffb000, 0 0 20px rgba(255,176,0,0.6)",
        },
        ".text-glow-red": {
          textShadow: "0 0 8px #ff003c, 0 0 20px rgba(255,0,60,0.6)",
        },
        ".glass-panel": {
          background: "linear-gradient(135deg, rgba(0,255,65,0.04) 0%, rgba(0,0,0,0) 60%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(0,255,65,0.12)",
        },
        ".scanlines": {
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
          pointerEvents: "none",
        },
        ".noise": {
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        },
        ".hud-corner": {
          position: "relative",
          "&::before, &::after": {
            content: "''",
            position: "absolute",
            width: "10px",
            height: "10px",
            borderColor: "#00ff41",
            borderStyle: "solid",
          },
          "&::before": {
            top: "0",
            left: "0",
            borderWidth: "1px 0 0 1px",
          },
          "&::after": {
            bottom: "0",
            right: "0",
            borderWidth: "0 1px 1px 0",
          },
        },
      })
    },
  ],
}

export default config
