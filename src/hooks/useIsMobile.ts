/**
 * Mobile Detection Hook
 *
 * Wrapper around useMediaQuery to centralize mobile breakpoint logic.
 * Returns true when viewport is below the mobile breakpoint (768px).
 * This controls EDITING capabilities (tools visible, not read-only).
 * Header responsiveness is handled separately via Tailwind breakpoints.
 */

import { useMediaQuery } from "usehooks-ts";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
