import { BEAT_SHADING, STAFF_CONFIG } from "../constants";
import { SystemInfo } from "../types";

export interface BeatShadingOptions {
  canvasWidth: number;
  beatsPerMeasure: number;
}

// Draw alternating beat stripes for a single system
export function drawSystemBeatShading(
  ctx: CanvasRenderingContext2D,
  system: SystemInfo,
  options: BeatShadingOptions,
): void {
  const { beatsPerMeasure } = options;
  const { lineGap, lines, padding, leftStart } = STAFF_CONFIG;
  const leftX = padding + leftStart;

  // Calculate staff vertical bounds for this system
  const staffTop = system.systemTop - 25;
  const staffBottom = system.systemTop + (lines - 1) * lineGap + 35;

  // Draw alternating beat stripes for each beat in this system
  const totalBeatsInSystem = system.measuresInSystem * beatsPerMeasure;

  for (let beat = 0; beat < totalBeatsInSystem; beat++) {
    const x = leftX + beat * system.pxPerBeat;
    const width = system.pxPerBeat;

    // Alternate colors based on beat position
    const isLightBeat = beat % 2 === 0;

    ctx.fillStyle = isLightBeat ? BEAT_SHADING.light : BEAT_SHADING.dark;
    ctx.fillRect(x, staffTop, width, staffBottom - staffTop);
  }
}

// Draw beat shading for all systems
export function drawAllBeatShading(
  ctx: CanvasRenderingContext2D,
  systems: SystemInfo[],
  options: BeatShadingOptions,
): void {
  systems.forEach((system) => {
    drawSystemBeatShading(ctx, system, options);
  });
}
