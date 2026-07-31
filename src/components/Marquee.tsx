const PHRASE = "PASTE ⚡ VISUALIZE ⚡ UNDERSTAND ⚡ ";

export default function Marquee() {
  const track = PHRASE.repeat(6);

  return (
    <div className="marquee-viewport w-full overflow-hidden border-y-2 border-ink bg-accent text-paper">
      <div className="marquee-track font-display text-xs tracking-tight py-1 whitespace-nowrap">
        <span>{track}</span>
        <span aria-hidden="true">{track}</span>
      </div>
    </div>
  );
}
