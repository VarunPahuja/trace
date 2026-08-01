import { ImageResponse } from "next/og";

// No `runtime = "edge"` — see opengraph-image.tsx for why (static prerender).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — same design as icon.svg (rotated amber badge, black
// border, black wordmark) rendered as a PNG since iOS home-screen icons
// don't accept SVG.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDF6E3",
        }}
      >
        <div
          style={{
            width: 156,
            height: 156,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F59E0B",
            border: "10px solid #111111",
            borderRadius: 28,
            transform: "rotate(-4deg)",
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 900, color: "#111111", letterSpacing: -1 }}>TRACE</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
