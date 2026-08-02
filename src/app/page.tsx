import Link from "next/link";
import DemoStage from "@/components/landing/DemoStage";
import { TOPICS } from "@/lib/trace/meta";

const CARDS = [
  {
    title: "Real execution",
    body: "Every step is real Python running in your browser via Pyodide — not an LLM imagining what your code might do.",
  },
  {
    title: "18 topics",
    body: "Arrays & Hashing through Advanced Graphs — every NeetCode-style pattern, two worked examples apiece.",
  },
  {
    title: "Share anything",
    body: "Paste your own code, or send a link that reproduces the exact trace, byte for byte, on someone else's machine.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center">
      <section className="w-full max-w-5xl mx-auto px-6 pt-14 sm:pt-20 pb-10 flex flex-col items-center text-center gap-6">
        <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-ink -rotate-2 inline-block shadow-neo border-neo bg-pop px-6 py-3">
          TRACE
        </h1>
        <p className="font-body text-lg sm:text-2xl text-ink/80 max-w-xl">
          Paste Python. Watch it run.
        </p>
        <Link href="/app" className="btn-neo-accent text-base sm:text-lg px-8 py-3">
          Try it →
        </Link>
      </section>

      <section className="w-full max-w-5xl mx-auto px-6 pb-14 sm:pb-20">
        <DemoStage />
      </section>

      <section className="w-full max-w-5xl mx-auto px-6 pb-14 sm:pb-20 grid sm:grid-cols-3 gap-4 sm:gap-6">
        {CARDS.map(({ title, body }, i) => (
          <div
            key={title}
            className={`card-neo p-5 flex flex-col gap-2 ${i === 1 ? "sm:-rotate-1" : i === 2 ? "sm:rotate-1" : ""}`}
          >
            <div className="font-display text-sm uppercase tracking-tight text-accent">{title}</div>
            <p className="font-body text-sm text-ink/80">{body}</p>
          </div>
        ))}
      </section>

      <section className="w-full max-w-5xl mx-auto px-6 pb-16 sm:pb-24 flex flex-col items-center gap-4">
        <div className="font-display text-xs uppercase tracking-wide text-ink/60">The full roadmap</div>
        <div className="flex flex-wrap justify-center gap-2">
          {TOPICS.map((topic) => (
            <span
              key={topic}
              className="font-mono text-xs sm:text-sm border-neo shadow-neo-sm rounded-full px-3 py-1.5 bg-paper text-ink/80"
            >
              {topic}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
