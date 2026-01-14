/**
 * Mobile Detection Hook
 *
 * Wrapper around useMediaQuery to centralize mobile breakpoint logic.
 * Returns true when viewport is below the mobile breakpoint (768px).
 */

import { useMediaQuery } from "usehooks-ts";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
