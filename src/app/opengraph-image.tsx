import { ImageResponse } from "next/og";

// No `runtime = "edge"` — this image has zero dynamic dependencies (no
// params, no request data), so leaving the default Node runtime lets
// Next.js prerender it once at build time as a static file instead of
// invoking a function on every request.
export const alt = "TRACE — watch your code think";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// One shared brand OG image for the whole app (Part B: "an OG image in
// the brand style, generate a static one") — every route inherits this
// unless it defines its own opengraph-image. Mirrors the landing page
// hero's exact visual language: paper background, hard-shadow rotated
// amber wordmark badge, the same one-line pitch.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          background: "#FDF6E3",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "#F59E0B",
            border: "6px solid #111111",
            borderRadius: 16,
            padding: "24px 56px",
            transform: "rotate(-3deg)",
            boxShadow: "12px 12px 0 0 #111111",
          }}
        >
          <span style={{ fontSize: 110, fontWeight: 900, color: "#111111", letterSpacing: -2 }}>TRACE</span>
        </div>
        <div style={{ display: "flex", fontSize: 40, color: "#111111", opacity: 0.75 }}>
          Paste Python. Watch it run.
        </div>
      </div>
    ),
    { ...size },
  );
}
