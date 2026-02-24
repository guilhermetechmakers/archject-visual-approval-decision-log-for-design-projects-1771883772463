/**
 * Brand-consistent illustration for 404 / empty states.
 * Uses dashed path and compass motif to communicate "not found" in a friendly way.
 */

export interface NotFoundIllustrationProps {
  className?: string
  /** Width/height for SVG - defaults to 160 */
  size?: number
}

export function NotFoundIllustration({ className, size = 160 }: NotFoundIllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={className}
      aria-hidden
      role="img"
    >
      {/* Background circle - soft accent */}
      <circle
        cx="80"
        cy="80"
        r="72"
        fill="rgb(var(--muted) / 0.5)"
        stroke="rgb(var(--border) / 0.8)"
        strokeWidth="1"
      />
      {/* Dashed path - "broken road" motif */}
      <path
        d="M 30 100 Q 50 60 80 80 Q 110 100 130 60"
        fill="none"
        stroke="rgb(var(--primary) / 0.3)"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
      />
      {/* Compass / direction icon - center */}
      <g transform="translate(80, 80)">
        <circle
          cx="0"
          cy="0"
          r="24"
          fill="rgb(var(--card))"
          stroke="rgb(var(--primary) / 0.5)"
          strokeWidth="2"
        />
        <path
          d="M 0 -14 L 4 6 L 0 4 L -4 6 Z"
          fill="rgb(var(--primary))"
        />
        <path
          d="M 0 14 L 4 -6 L 0 -4 L -4 -6 Z"
          fill="rgb(var(--primary) / 0.4)"
        />
        <circle cx="0" cy="0" r="3" fill="rgb(var(--primary))" />
      </g>
      {/* Question mark hint - top right */}
      <text
        x="130"
        y="35"
        fontSize="24"
        fontWeight="600"
        fill="rgb(var(--muted-foreground) / 0.6)"
        fontFamily="Inter, system-ui, sans-serif"
      >
        ?
      </text>
    </svg>
  )
}
