import { SystemInfo, RepeatBarType } from "../types";
import { STAFF_CONFIG, THEME, SMUFL_GLYPHS, MUSIC_FONT } from "../constants";

export interface StaffRenderOptions {
  canvasWidth: number;
  canvasHeight: number;
  title?: string;
  subtitle?: string;
}

// Draw background and title
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  options: StaffRenderOptions,
): void {
  const { canvasWidth, canvasHeight, title, subtitle } = options;
  const { padding } = STAFF_CONFIG;

  // Clear canvas with white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Title
  if (title) {
    ctx.fillStyle = "#1e293b";
    ctx.font =
      '700 18px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
    ctx.fillText(title, padding, 48);
  }

  // Subtitle
  if (subtitle) {
    ctx.fillStyle = "#64748b";
    ctx.font =
      '12px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
    ctx.fillText(subtitle, padding, 70);
  }
}

// Draw a single staff system (one line of music)
export function drawStaffSystem(
  ctx: CanvasRenderingContext2D,
  systemTop: number,
  systemIndex: number,
  totalSystems: number,
  canvasWidth: number,
): void {
  const { lines, lineGap, padding } = STAFF_CONFIG;

  // Draw the 3 staff lines
  ctx.strokeStyle = THEME.line;
  ctx.lineWidth = 2;

  for (let i = 0; i < lines; i++) {
    const y = systemTop + i * lineGap;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvasWidth - padding, y);
    ctx.stroke();
  }

  // Draw treble clef symbol using Leland music font (with fallback)
  ctx.fillStyle = THEME.ink;
  ctx.font = `72px "${MUSIC_FONT}", serif`;
  ctx.fillText(SMUFL_GLYPHS.gClef, padding + 8, systemTop + lineGap * 1.5 + 8);

  // Draw 4/4 time signature
  ctx.fillStyle = THEME.ink;
  ctx.font =
    '700 22px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
  ctx.textAlign = "center";
  ctx.fillText("4", padding + 70, systemTop + lineGap * 0.5 + 6);
  ctx.fillText("4", padding + 70, systemTop + lineGap * 1.5 + 6);
  ctx.textAlign = "left";

  // System label (Line X of Y)
  if (totalSystems > 1) {
    ctx.fillStyle = "rgba(167,176,195,.6)";
    ctx.font =
      '11px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
    ctx.fillText(
      `Line ${systemIndex + 1}`,
      canvasWidth - padding - 45,
      systemTop - 12,
    );
  }
}

// Draw all staff systems
export function drawAllSystems(
  ctx: CanvasRenderingContext2D,
  systems: SystemInfo[],
  canvasWidth: number,
): void {
  systems.forEach((system, index) => {
    drawStaffSystem(ctx, system.systemTop, index, systems.length, canvasWidth);
  });
}

// Draw repeat dots at a barline position
function drawRepeatDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  systemTop: number,
  side: "left" | "right",
): void {
  const { lineGap } = STAFF_CONFIG;
  const dotRadius = 4;
  const offset = side === "left" ? -12 : 12;

  ctx.fillStyle = THEME.ink;

  // Draw two dots in the middle spaces of the staff
  // For 3-line staff: dots go in spaces between lines 1-2 and 2-3
  const dot1Y = systemTop + lineGap * 0.5; // Between top and middle line
  const dot2Y = systemTop + lineGap * 1.5; // Between middle and bottom line

  ctx.beginPath();
  ctx.arc(x + offset, dot1Y, dotRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + offset, dot2Y, dotRadius, 0, Math.PI * 2);
  ctx.fill();
}

// Draw a single barline with optional repeat styling
function drawBarLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  systemTop: number,
  barType: RepeatBarType,
): void {
  const { lineGap, lines } = STAFF_CONFIG;
  const top = systemTop - 8;
  const bottom = systemTop + (lines - 1) * lineGap + 8;

  if (barType === "none") {
    // Regular barline
    ctx.strokeStyle = "rgba(217,222,234,.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  } else if (barType === "start") {
    // Start repeat: thick bar, thin bar, dots on right
    ctx.strokeStyle = THEME.ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 8, top);
    ctx.lineTo(x + 8, bottom);
    ctx.stroke();

    drawRepeatDots(ctx, x + 8, systemTop, "right");
  } else if (barType === "end") {
    // End repeat: dots on left, thin bar, thick bar
    drawRepeatDots(ctx, x - 8, systemTop, "left");

    ctx.strokeStyle = THEME.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, top);
    ctx.lineTo(x - 8, bottom);
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  } else if (barType === "both") {
    // Both: end repeat followed by start repeat
    drawRepeatDots(ctx, x - 12, systemTop, "left");

    ctx.strokeStyle = THEME.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 12, top);
    ctx.lineTo(x - 12, bottom);
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 12, top);
    ctx.lineTo(x + 12, bottom);
    ctx.stroke();

    drawRepeatDots(ctx, x + 12, systemTop, "right");
  }
}

// Draw bar lines for a system
export function drawBarLines(
  ctx: CanvasRenderingContext2D,
  system: SystemInfo,
  systemIndex: number,
  isLastSystem: boolean,
): void {
  const { padding, leftStart } = STAFF_CONFIG;
  const leftX = padding + leftStart;

  system.bars.forEach((x, idx) => {
    // Skip if outside visible area
    if (x < leftX - 2) return;

    // Skip the last bar on non-last systems (will be drawn at start of next system)
    const isLastBar = idx === system.bars.length - 1;
    if (isLastBar && !isLastSystem) return;

    const barType = system.barTypes?.[idx] || "none";
    drawBarLine(ctx, x, system.systemTop, barType);

    // Measure number hint (skip first and last, and skip repeat bars)
    if (idx > 0 && idx < system.bars.length - 1 && barType === "none") {
      ctx.fillStyle = "rgba(167,176,195,.7)";
      ctx.font =
        '11px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
      const measureNum = system.startMeasureIndex + idx;
      ctx.fillText(String(measureNum), x - 4, system.systemTop - 14);
    }
  });
}

// Draw all bar lines for all systems
export function drawAllBarLines(
  ctx: CanvasRenderingContext2D,
  systems: SystemInfo[],
): void {
  systems.forEach((system, index) => {
    const isLastSystem = index === systems.length - 1;
    drawBarLines(ctx, system, index, isLastSystem);
  });
}

// Draw playhead line (smooth cursor)
export function drawPlayhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  systemTop: number,
): void {
  const { lineGap, lines } = STAFF_CONFIG;

  ctx.strokeStyle = THEME.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, systemTop - 15);
  ctx.lineTo(x, systemTop + (lines - 1) * lineGap + 15);
  ctx.stroke();

  // Draw small triangle at top
  ctx.fillStyle = THEME.accent;
  ctx.beginPath();
  ctx.moveTo(x, systemTop - 15);
  ctx.lineTo(x - 6, systemTop - 22);
  ctx.lineTo(x + 6, systemTop - 22);
  ctx.closePath();
  ctx.fill();
}

// Legacy function for compatibility
export function drawStaff(
  ctx: CanvasRenderingContext2D,
  options: StaffRenderOptions,
): void {
  drawBackground(ctx, options);
}

// Re-export getYForPosition from SheetRenderer for compatibility
export { getYForPosition } from "./SheetRenderer";
