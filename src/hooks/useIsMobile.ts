/**
 * Mobile Detection Hook
 *
 * Wrapper around useMediaQuery to centralize mobile breakpoint logic.
 * Returns true when viewport is below the mobile breakpoint (1024px).
 * We use 1024px (Tailwind's lg) because the header has many controls
 * that don't fit well on smaller screens.
 */

import { useMediaQuery } from "usehooks-ts";

const MOBILE_BREAKPOINT = 1024;

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
