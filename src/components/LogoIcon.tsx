interface LogoIconProps {
  className?: string;
}

/**
 * Rochel's Piano School logo icon - piano keyboard symbol
 * Used as favicon and throughout the app
 * In memory of Batya - The Batya Method
 */
export function LogoIcon({ className = "w-6 h-6" }: LogoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Rochel's Piano School"
    >
      {/* Piano body */}
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Black keys */}
      <rect x="5" y="4" width="3" height="10" fill="currentColor" />
      <rect x="10" y="4" width="3" height="10" fill="currentColor" />
      <rect x="16" y="4" width="3" height="10" fill="currentColor" />
    </svg>
  );
}
