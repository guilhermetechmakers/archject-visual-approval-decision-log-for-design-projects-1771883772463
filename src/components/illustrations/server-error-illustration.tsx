/**
 * Server Error illustration - brand-consistent SVG for 500 error page.
 * Broken gear / alert motif to communicate server malfunction.
 * Uses Archject palette (deep green, muted grays).
 */

export interface ServerErrorIllustrationProps {
  className?: string
  /** Width/height for scaling. Default 200. */
  size?: number
}

export function ServerErrorIllustration({
  className,
  size = 200,
}: ServerErrorIllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {/* Broken gear - main gear with crack */}
      <g transform="translate(100, 100)">
        {/* Gear body - circle with teeth */}
        <path
          d="M0 -45 L4 -45 L6 -38 L10 -40 L12 -32 L18 -32 L18 -26 L24 -24 L22 -16 L28 -14 L24 -6 L30 0 L24 6 L28 14 L22 16 L24 24 L18 26 L18 32 L12 32 L10 40 L6 38 L4 45 L0 45 L-4 45 L-6 38 L-10 40 L-12 32 L-18 32 L-18 26 L-24 24 L-22 16 L-28 14 L-24 6 L-30 0 L-24 -6 L-28 -14 L-22 -16 L-24 -24 L-18 -26 L-18 -32 L-12 -32 L-10 -40 L-6 -38 L-4 -45 Z"
          fill="rgb(245 246 250)"
          stroke="rgb(25 92 74)"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.9"
        />
        {/* Crack through gear */}
        <path
          d="M0 -20 L0 20"
          stroke="rgb(255 108 108)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M0 0 L15 8"
          stroke="rgb(255 108 108)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Center hub */}
        <circle
          cx="0"
          cy="0"
          r="12"
          fill="rgb(255 255 255)"
          stroke="rgb(25 92 74)"
          strokeWidth="2"
        />
        {/* Alert exclamation */}
        <path
          d="M-2 -8 L2 -8 L1 4 L-1 4 Z"
          fill="rgb(255 108 108)"
          transform="translate(0, 0)"
        />
        <circle cx="0" cy="10" r="1.5" fill="rgb(255 108 108)" />
      </g>
      {/* Decorative dashed arcs - server/connection motif */}
      <path
        d="M30 170 Q100 140 170 170"
        fill="none"
        stroke="rgb(25 92 74)"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  )
}
