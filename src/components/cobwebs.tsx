/**
 * Decorative SVG cobwebs anchored to the top corners of the screen.
 * Pointer-events disabled so it never intercepts taps. Uses currentColor
 * (defaults to a soft foreground tint) so it sits gently over any theme.
 */
export function HalloweenCobwebs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-between"
    >
      <CobwebSvg className="h-24 w-24 text-foreground/40 sm:h-28 sm:w-28" />
      <CobwebSvg className="h-24 w-24 -scale-x-100 text-foreground/40 sm:h-28 sm:w-28" />
    </div>
  );
}

function CobwebSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
    >
      {/* Radial threads from the corner (0,0) */}
      <line x1="0" y1="0" x2="100" y2="20" />
      <line x1="0" y1="0" x2="95" y2="40" />
      <line x1="0" y1="0" x2="80" y2="60" />
      <line x1="0" y1="0" x2="60" y2="80" />
      <line x1="0" y1="0" x2="40" y2="95" />
      <line x1="0" y1="0" x2="20" y2="100" />
      {/* Concentric web arcs */}
      <path d="M 25 0 Q 18 18 0 25" />
      <path d="M 50 0 Q 36 36 0 50" />
      <path d="M 75 0 Q 54 54 0 75" />
      <path d="M 100 20 Q 60 60 20 100" />
      {/* Tiny spider hanging from a thread */}
      <line x1="70" y1="0" x2="70" y2="55" />
      <circle cx="70" cy="60" r="3.5" fill="currentColor" stroke="none" />
      <line x1="68" y1="58" x2="62" y2="55" />
      <line x1="68" y1="60" x2="60" y2="62" />
      <line x1="68" y1="62" x2="62" y2="68" />
      <line x1="72" y1="58" x2="78" y2="55" />
      <line x1="72" y1="60" x2="80" y2="62" />
      <line x1="72" y1="62" x2="78" y2="68" />
    </svg>
  );
}
