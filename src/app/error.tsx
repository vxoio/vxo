"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[VXO Error]", error)
  }, [error])

  return (
    <div className="fixed inset-0 bg-vxo-void flex items-center justify-center p-8">
      <div className="font-mono text-center space-y-4">
        <p className="text-vxo-red text-sm">SYSTEM FAULT — {error.digest ?? "unknown"}</p>
        <pre className="text-slate-400 text-xs max-w-lg whitespace-pre-wrap text-left border border-vxo-red/20 p-4">
          {error.message}
        </pre>
        <button
          onClick={reset}
          className="font-mono text-xs px-4 py-2 border border-vxo-green/40 text-vxo-green hover:bg-vxo-green/10"
        >
          RETRY
        </button>
      </div>
    </div>
  )
}
