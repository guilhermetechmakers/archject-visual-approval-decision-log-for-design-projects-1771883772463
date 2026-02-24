/**
 * Not Found illustration - brand-consistent SVG for 404 and empty states.
 * Uses dashed path / compass motif to communicate "page not found".
 * Stroke width and colors align with Archject palette (deep green, muted grays).
 */

export interface NotFoundIllustrationProps {
  className?: string
  /** Width/height for scaling. Default 240. */
  size?: number
}

export function NotFoundIllustration({
  className,
  size = 240,
}: NotFoundIllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={size * (200 / 240)}
      className={className}
      aria-hidden
    >
      {/* Dashed path / broken route - decision-tree motif */}
      <path
        d="M40 100 Q80 60 120 80 T200 90"
        fill="none"
        stroke="rgb(25 92 74)"
        strokeWidth="2"
        strokeDasharray="8 6"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M120 80 L120 140 M120 140 L80 180 M120 140 L160 180"
        fill="none"
        stroke="rgb(25 92 74)"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Magnifying glass with question mark inside */}
      <circle
        cx="120"
        cy="80"
        r="28"
        fill="none"
        stroke="rgb(25 92 74)"
        strokeWidth="2.5"
      />
      <path
        d="M138 98 L155 115"
        stroke="rgb(25 92 74)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text
        x="120"
        y="86"
        textAnchor="middle"
        fill="rgb(25 92 74)"
        fontSize="24"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
      >
        ?
      </text>
      {/* Small document/folder icons as decorative elements */}
      <rect
        x="50"
        y="150"
        width="24"
        height="30"
        rx="2"
        fill="rgb(245 246 250)"
        stroke="rgb(230 232 240)"
        strokeWidth="1"
      />
      <path
        d="M54 150 L54 155 L58 155"
        fill="none"
        stroke="rgb(107 114 128)"
        strokeWidth="1"
        opacity="0.6"
      />
      <rect
        x="166"
        y="155"
        width="28"
        height="22"
        rx="2"
        fill="rgb(245 246 250)"
        stroke="rgb(230 232 240)"
        strokeWidth="1"
      />
      <path
        d="M170 155 L170 160 L174 160"
        fill="none"
        stroke="rgb(107 114 128)"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  )
}
