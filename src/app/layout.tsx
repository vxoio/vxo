import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["300", "400", "500", "700"],
})

export const metadata: Metadata = {
  title: "VXO Labs — Cyber-Native Engineering",
  description:
    "Cloud automation, AI orchestration, and enterprise-grade cyber systems. Unrestricted access.",
  keywords: ["VXO Labs", "cloud automation", "AI engineering", "CDP", "browser automation"],
  authors: [{ name: "VXO Prime" }],
  openGraph: {
    title: "VXO Labs",
    description: "Level-5 clearance required.",
    type: "website",
    url: "https://vxo.io",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VXO Labs",
    description: "Cyber-native systems engineering.",
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="bg-vxo-void text-vxo-white antialiased overflow-x-hidden">
        {/* Persistent ambient overlays */}
        <div className="vxo-noise-overlay" aria-hidden="true" />
        <div className="vxo-scanlines"     aria-hidden="true" />

        {/* Root content */}
        {children}
      </body>
    </html>
  )
}
