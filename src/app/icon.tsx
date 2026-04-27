import { ImageResponse } from "next/og"

export const size        = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32, height: 32,
          background: "#070b0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer hex ring */}
        <div
          style={{
            width: 24, height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Hex approximated with a rotated square + clipping */}
          <div
            style={{
              position: "absolute",
              width: 20, height: 20,
              border: "1.8px solid #00ff41",
              borderRadius: 3,
              transform: "rotate(15deg)",
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 20, height: 20,
              border: "1.8px solid #00ff41",
              borderRadius: 3,
              transform: "rotate(-15deg)",
              opacity: 0.5,
            }}
          />
          {/* Center dot */}
          <div
            style={{
              width: 6, height: 6,
              background: "#00ff41",
              borderRadius: "50%",
              boxShadow: "0 0 6px #00ff41",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  )
}
