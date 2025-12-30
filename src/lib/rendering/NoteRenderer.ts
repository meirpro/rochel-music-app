import { RenderedNote } from "../types";
import {
  STAFF_CONFIG,
  getNoteColor,
  THEME,
  SMUFL_GLYPHS,
  MUSIC_FONT,
} from "../constants";

export interface NoteRenderOptions {
  showLabels: boolean;
  monoMode: boolean;
  useStandardNotation: boolean;
}

// Draw duration extension bar for notes longer than 1 beat
function drawDurationExtension(
  ctx: CanvasRenderingContext2D,
  note: RenderedNote,
  color: string,
): void {
  if (note.duration <= 1 || note.pitch === "REST") return;

  const { noteRadius } = STAFF_CONFIG;
  // Note has 0.25 beat visual offset, so extension ends at the beat boundary
  // where the note's duration actually ends (not where next note is rendered)
  const visualOffset = 0.25;
  const extensionWidth =
    (note.duration - visualOffset) * note.pxPerBeat - noteRadius;
  const extensionHeight = 8;

  if (extensionWidth <= 0) return;

  // Draw a colored bar extending from the note
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.roundRect(
    note.x + noteRadius - 2,
    note.y - extensionHeight / 2,
    extensionWidth,
    extensionHeight,
    4,
  );
  ctx.fill();
  ctx.globalAlpha = 1;
}

// Get SMuFL notehead glyph based on duration
function getNoteheadGlyph(duration: number): string {
  if (duration >= 4) return SMUFL_GLYPHS.noteheadWhole;
  if (duration >= 2) return SMUFL_GLYPHS.noteheadHalf;
  return SMUFL_GLYPHS.noteheadBlack;
}

// Draw note using standard music notation (SMuFL glyphs)
function drawStandardNote(
  ctx: CanvasRenderingContext2D,
  note: RenderedNote,
  options: NoteRenderOptions,
  isActive: boolean,
): void {
  const { showLabels } = options;
  const { noteRadius, lineGap, lines, topMargin, systemGap } = STAFF_CONFIG;
  const systemTop = topMargin + note.systemIndex * systemGap;
  const stemUp = note.staffPosition <= 4;
  const glyphSize = 38;

  // Draw ledger line if note is at position 0 (C4)
  if (note.staffPosition === 0) {
    ctx.strokeStyle = THEME.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(note.x - noteRadius - 6, note.y);
    ctx.lineTo(note.x + noteRadius + 6, note.y);
    ctx.stroke();
  }

  // Draw glow effect for active note
  if (isActive) {
    ctx.save();
    ctx.shadowColor = THEME.accent;
    ctx.shadowBlur = 20;
  }

  // Draw notehead glyph
  const glyph = getNoteheadGlyph(note.duration);
  ctx.fillStyle = THEME.ink;
  ctx.font = `${glyphSize}px ${MUSIC_FONT}, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, note.x, note.y);

  if (isActive) {
    ctx.restore();
  }

  // Draw stem (not for whole notes)
  if (note.duration < 4) {
    ctx.strokeStyle = THEME.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (stemUp) {
      ctx.moveTo(note.x + 7, note.y - 2);
      ctx.lineTo(note.x + 7, note.y - 36);
    } else {
      ctx.moveTo(note.x - 7, note.y + 2);
      ctx.lineTo(note.x - 7, note.y + 36);
    }
    ctx.stroke();

    // Draw flag for eighth notes
    if (note.duration <= 0.5) {
      ctx.fillStyle = THEME.ink;
      ctx.font = `${glyphSize}px ${MUSIC_FONT}, serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      if (stemUp) {
        ctx.fillText(SMUFL_GLYPHS.flag8thUp, note.x + 6, note.y - 34);
      } else {
        ctx.fillText(SMUFL_GLYPHS.flag8thDown, note.x - 8, note.y + 36);
      }
    }
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Draw label above notes if enabled
  if (showLabels) {
    ctx.fillStyle = THEME.ink;
    ctx.font =
      '700 14px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
    ctx.fillText(note.displayName, note.x - 5, systemTop - 35);
  }

  // Draw lyric below staff
  if (note.lyric) {
    ctx.fillStyle = THEME.ink;
    ctx.font =
      '13px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
    ctx.fillText(
      note.lyric,
      note.x - 10,
      systemTop + (lines - 1) * lineGap + 50,
    );
  }
}

// Draw note using kid-friendly style (colored ovals with letters)
function drawKidNote(
  ctx: CanvasRenderingContext2D,
  note: RenderedNote,
  options: NoteRenderOptions,
  isActive: boolean,
): void {
  const { showLabels, monoMode } = options;
  const { noteRadius, lineGap, lines, topMargin, systemGap } = STAFF_CONFIG;
  const color = monoMode ? THEME.ink : getNoteColor(note.pitch);
  const systemTop = topMargin + note.systemIndex * systemGap;
  const stemUp = note.staffPosition <= 4;

  // Draw duration extension first (behind the note)
  drawDurationExtension(ctx, note, color);

  // Draw ledger line if note is at position 0 (C4)
  if (note.staffPosition === 0) {
    ctx.strokeStyle = THEME.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(note.x - noteRadius - 6, note.y);
    ctx.lineTo(note.x + noteRadius + 6, note.y);
    ctx.stroke();
  }

  // Draw glow effect for active note
  if (isActive) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.ellipse(
      note.x,
      note.y,
      noteRadius + 2,
      noteRadius - 2,
      -0.35,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  // Draw note head (oval)
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(0,0,0,.35)";
  ctx.lineWidth = 2;
  ctx.ellipse(
    note.x,
    note.y,
    noteRadius,
    noteRadius - 4,
    -0.35,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.stroke();

  // Draw letter inside the note
  ctx.fillStyle = "#0b0c10";
  ctx.font =
    '700 11px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(note.displayName, note.x, note.y + 1);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Draw stem
  ctx.strokeStyle = THEME.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (stemUp) {
    ctx.moveTo(note.x + noteRadius - 2, note.y);
    ctx.lineTo(note.x + noteRadius - 2, note.y - 42);
  } else {
    ctx.moveTo(note.x - noteRadius + 2, note.y);
    ctx.lineTo(note.x - noteRadius + 2, note.y + 42);
  }
  ctx.stroke();

  // Draw label above notes if enabled
  if (showLabels) {
    ctx.fillStyle = monoMode ? THEME.ink : color;
    ctx.font =
      '700 14px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
    ctx.fillText(note.displayName, note.x - 5, systemTop - 35);
  }

  // Draw lyric below staff
  if (note.lyric) {
    ctx.fillStyle = THEME.ink;
    ctx.font =
      '13px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
    ctx.fillText(
      note.lyric,
      note.x - 10,
      systemTop + (lines - 1) * lineGap + 50,
    );
  }
}

export function drawNote(
  ctx: CanvasRenderingContext2D,
  note: RenderedNote,
  options: NoteRenderOptions,
  isActive = false,
): void {
  if (options.useStandardNotation) {
    drawStandardNote(ctx, note, options, isActive);
  } else {
    drawKidNote(ctx, note, options, isActive);
  }
}

// Draw all notes
export function drawNotes(
  ctx: CanvasRenderingContext2D,
  notes: RenderedNote[],
  options: NoteRenderOptions,
  activeIndex = -1,
): void {
  notes.forEach((note, index) => {
    drawNote(ctx, note, options, index === activeIndex);
  });
}

// Hit test for clicking notes
export function hitTestNote(
  x: number,
  y: number,
  notes: RenderedNote[],
): number {
  const { noteRadius } = STAFF_CONFIG;
  const hitRadius = noteRadius + 8;

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const dx = x - note.x;
    const dy = y - note.y;
    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
      return i;
    }
  }
  return -1;
}
