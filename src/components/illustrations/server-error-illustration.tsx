/**
 * Server Error illustration - brand-consistent SVG for 500 and server error states.
 * Uses broken gear / alert motif to communicate "server error".
 * Stroke and colors align with Archject palette (deep green, muted grays).
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
      {/* Gear outline - simplified broken gear */}
      <path
        d="M100 45 L115 52 L122 68 L118 85 L100 92 L82 85 L78 68 L85 52 Z"
        fill="rgb(247 248 250)"
        stroke="rgb(25 92 74)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Crack through gear */}
      <path
        d="M100 45 L100 92 M78 68 L122 68"
        fill="none"
        stroke="rgb(255 108 108)"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Center circle */}
      <circle
        cx="100"
        cy="68"
        r="10"
        fill="rgb(25 92 74)"
        opacity="0.4"
      />
      {/* Server stack / blocks below */}
      <rect
        x="70"
        y="110"
        width="60"
        height="16"
        rx="2"
        fill="rgb(245 246 250)"
        stroke="rgb(230 232 240)"
        strokeWidth="1"
      />
      <rect
        x="70"
        y="132"
        width="60"
        height="16"
        rx="2"
        fill="rgb(245 246 250)"
        stroke="rgb(230 232 240)"
        strokeWidth="1"
      />
      <rect
        x="70"
        y="154"
        width="60"
        height="16"
        rx="2"
        fill="rgb(245 246 250)"
        stroke="rgb(230 232 240)"
        strokeWidth="1"
      />
      {/* Alert icon on middle block */}
      <path
        d="M100 140 L100 148 M100 151 L100 153"
        stroke="rgb(255 108 108)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
