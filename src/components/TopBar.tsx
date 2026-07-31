import Link from "next/link";
import Marquee from "./Marquee";
import ShareButton from "./ShareButton";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-paper">
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b-2 border-ink">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl uppercase tracking-tight text-ink -rotate-2 inline-block shadow-neo-sm border-neo bg-pop px-2 py-0.5">
            TRACE
          </span>
          <span
            id="topic-badge"
            className="hidden sm:inline-block font-body text-xs uppercase tracking-wide border-neo rounded-full px-3 py-1 bg-paper text-ink/60"
          >
            no topic loaded
          </span>
        </div>

        <nav className="flex items-center gap-4 font-display text-sm uppercase tracking-tight">
          <Link href="/" className="hover:text-accent transition-colors">
            Visualizer
          </Link>
          <Link href="/tracker" className="hover:text-accent transition-colors">
            Tracker
          </Link>
          <ShareButton />
        </nav>
      </div>
      <Marquee />
    </header>
  );
}
