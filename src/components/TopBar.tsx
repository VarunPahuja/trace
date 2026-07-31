import Link from "next/link";
import Marquee from "./Marquee";
import ShareButton from "./ShareButton";
import TopicBadge from "./TopicBadge";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 py-3 border-b-2 border-ink">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg sm:text-2xl uppercase tracking-tight text-ink -rotate-2 inline-block shadow-neo-sm border-neo bg-pop px-2 py-0.5">
            TRACE
          </span>
          <TopicBadge />
        </div>

        <nav className="flex items-center gap-3 sm:gap-4 font-display text-xs sm:text-sm uppercase tracking-tight">
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
