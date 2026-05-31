/**
 * VoltaBracketLayer.tsx - Renders volta brackets (1st/2nd endings) above the staff
 *
 * Volta brackets appear above the staff as a bracket with a number label:
 *      ┌─────── 1. ───────┐
 *      │                  │
 *
 * The bracket indicates which notes to play on which pass of a repeat section.
 */

import { VoltaBracket, NoteTool } from "../types";
import { SystemLayout } from "../utils/systemLayout";
import { LEFT_MARGIN, LINE_SPACING } from "@/lib/layoutUtils";
import type {
  VoltaStartState,
  VoltaResizeState,
} from "../hooks/useVoltaPlacement";

interface VoltaBracketLayerProps {
  voltaBrackets: VoltaBracket[];
  onVoltaBracketsChange?: (brackets: VoltaBracket[]) => void;
  systemLayouts: SystemLayout[];
  staffCenterY: number; // Y position of staff center
  staffLines?: number; // Number of visible staff lines (3, 4, or 5)
  measuresPerRow: number;
  selectedTool?: NoteTool | null;
  hoveredVolta?: string | null;
  setHoveredVolta?: (id: string | null) => void;
  // Ghost-preview state — set while user is placing a volta (after first click)
  voltaStart?: VoltaStartState | null;
  hoveredVoltaMeasure?: { system: number; measure: number } | null;
  // Which system this layer instance is rendering, so it can decide whether
  // to draw the ghost (only the system containing voltaStart owns the preview)
  systemIndex?: number;
  // Resize state + handler — when a volta is being resized, override its endMeasure
  // with the live value and skip click-to-delete on the handle.
  voltaResize?: VoltaResizeState | null;
  onVoltaResizeStart?: (voltaId: string, edge: "end") => void;
}

// Volta bracket visual constants
const VOLTA_ABOVE_STAFF = 5; // Distance above staff top (positive = above)
const VOLTA_HEIGHT = 14; // Height of the vertical drops
const VOLTA_LINE_WIDTH = 2; // Line thickness
const VOLTA_LABEL_OFFSET = 8; // Distance from left edge to label

export function VoltaBracketLayer({
  voltaBrackets,
  onVoltaBracketsChange,
  systemLayouts,
  staffCenterY,
  staffLines = 5,
  measuresPerRow,
  selectedTool,
  hoveredVolta,
  setHoveredVolta,
  voltaStart = null,
  hoveredVoltaMeasure = null,
  systemIndex,
  voltaResize = null,
  onVoltaResizeStart,
}: VoltaBracketLayerProps) {
  // Decide whether to render a ghost preview bracket for the in-progress placement.
  // Only the system that owns voltaStart draws the preview (avoids duplicates
  // across multi-system layouts and matches how committed voltas are rendered).
  const showGhost =
    selectedTool === "volta" &&
    voltaStart !== null &&
    hoveredVoltaMeasure !== null &&
    systemIndex !== undefined &&
    voltaStart.system === systemIndex &&
    hoveredVoltaMeasure.system === systemIndex;

  if (voltaBrackets.length === 0 && !showGhost) return null;

  // Calculate staff top position based on visible lines
  // Staff top varies: -2 * LINE_SPACING (5 lines), -1 * LINE_SPACING (4 lines), 0 (3 lines)
  const staffTopOffset =
    staffLines === 5
      ? -2 * LINE_SPACING
      : staffLines === 4
        ? -1 * LINE_SPACING
        : 0;
  const staffTopY = staffCenterY + staffTopOffset;

  // Ghost-bracket geometry (computed only if showGhost is true)
  let ghostGeometry: {
    startX: number;
    endX: number;
    y: number;
    measureCount: number;
  } | null = null;

  if (
    showGhost &&
    voltaStart &&
    hoveredVoltaMeasure &&
    systemIndex !== undefined
  ) {
    const systemLayout = systemLayouts[systemIndex];
    if (systemLayout) {
      // Normalize start/end so the user can drag in either direction
      const [lowMeasureInSystem, highMeasureInSystem] =
        voltaStart.measure <= hoveredVoltaMeasure.measure
          ? [voltaStart.measure, hoveredVoltaMeasure.measure]
          : [hoveredVoltaMeasure.measure, voltaStart.measure];

      const startInfo = systemLayout.measures[lowMeasureInSystem];
      const endInfo = systemLayout.measures[highMeasureInSystem];

      if (startInfo && endInfo) {
        const startX = LEFT_MARGIN + startInfo.xOffset - startInfo.prefixWidth;
        const endX =
          LEFT_MARGIN +
          endInfo.xOffset +
          endInfo.beatsInMeasure * systemLayout.beatWidth +
          endInfo.suffixWidth;
        ghostGeometry = {
          startX,
          endX,
          y: staffTopY - VOLTA_ABOVE_STAFF,
          measureCount: highMeasureInSystem - lowMeasureInSystem + 1,
        };
      }
    }
  }

  // Render each volta bracket
  return (
    <g className="volta-brackets">
      {voltaBrackets.map((volta) => {
        // While resizing, show the live endMeasure instead of the committed value
        const liveEndMeasure =
          voltaResize?.voltaId === volta.id
            ? voltaResize.currentEndMeasure
            : volta.endMeasure;
        const isResizingThis = voltaResize?.voltaId === volta.id;

        // Find which system(s) this volta spans
        const startSystemIndex = Math.floor(
          volta.startMeasure / measuresPerRow,
        );
        const endSystemIndex = Math.floor(
          (liveEndMeasure - 1) / measuresPerRow,
        );

        // The parent filter includes voltas that touch any system in
        // [startSystemIndex, endSystemIndex]. Each system draws ONLY its slice.
        // systemIndex is the system this layer instance is rendering for.
        const thisSystem = systemIndex ?? startSystemIndex;
        if (thisSystem < startSystemIndex || thisSystem > endSystemIndex) {
          return null;
        }
        const isStartSystem = thisSystem === startSystemIndex;
        const isEndSystem = thisSystem === endSystemIndex;

        const systemLayout = systemLayouts[thisSystem];
        if (!systemLayout) {
          console.warn(
            `[VoltaBracketLayer] No systemLayout for system ${thisSystem}`,
          );
          return null;
        }

        // Compute the slice bounds for this system: clamp left to the volta's
        // start only on the start system (otherwise begin at the row's first
        // measure), and clamp right to the volta's end only on the end system
        // (otherwise extend to the row's last measure).
        const sliceStartMeasureInSystem = isStartSystem
          ? volta.startMeasure % measuresPerRow
          : 0;
        const sliceEndMeasureInSystem = isEndSystem
          ? ((liveEndMeasure - 1) % measuresPerRow) + 1
          : measuresPerRow;

        // Find measure X positions from layout
        const startMeasureInfo =
          systemLayout.measures[sliceStartMeasureInSystem];
        const endMeasureInfo =
          systemLayout.measures[sliceEndMeasureInSystem - 1];

        if (!startMeasureInfo || !endMeasureInfo) {
          console.warn(
            `[VoltaBracketLayer] Missing measure info for volta ${volta.id} on system ${thisSystem}`,
          );
          return null;
        }

        // Calculate X coordinates using xOffset (accounts for decoration spacing)
        // This matches how StaffSystem.tsx positions barlines and ensures the bracket
        // extends over repeat marker spacing (prefix/suffix widths).
        const startX =
          LEFT_MARGIN + startMeasureInfo.xOffset - startMeasureInfo.prefixWidth;
        const endX =
          LEFT_MARGIN +
          endMeasureInfo.xOffset +
          endMeasureInfo.beatsInMeasure * systemLayout.beatWidth +
          endMeasureInfo.suffixWidth;

        // Y position (above staff top)
        const y = staffTopY - VOLTA_ABOVE_STAFF;

        const isHovered = hoveredVolta === volta.id;
        const isDeleteMode = selectedTool === "delete";
        const canDelete = isDeleteMode && onVoltaBracketsChange;

        return (
          <g
            key={volta.id}
            className="volta-bracket"
            style={{
              cursor: canDelete ? "pointer" : "default",
              opacity: isHovered && canDelete ? 0.6 : 1,
            }}
            onMouseEnter={() => setHoveredVolta?.(volta.id)}
            onMouseLeave={() => setHoveredVolta?.(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (canDelete) {
                onVoltaBracketsChange(
                  voltaBrackets.filter((v) => v.id !== volta.id),
                );
              }
            }}
          >
            {/* Horizontal line at top — drawn on every system the volta touches */}
            <line
              x1={startX}
              y1={y}
              x2={endX}
              y2={y}
              stroke="#991b1b"
              strokeWidth={VOLTA_LINE_WIDTH}
            />

            {/* Left vertical drop — only on the start system. Continuation rows
                begin "open" so the eye reads the bracket as carrying over. */}
            {isStartSystem && (
              <line
                x1={startX}
                y1={y}
                x2={startX}
                y2={y + VOLTA_HEIGHT}
                stroke="#991b1b"
                strokeWidth={VOLTA_LINE_WIDTH}
              />
            )}

            {/* Right vertical drop — solid on the end system (closes the bracket),
                dashed on intermediate/start systems (indicates continuation onto
                the next row). */}
            <line
              x1={endX}
              y1={y}
              x2={endX}
              y2={y + VOLTA_HEIGHT}
              stroke="#991b1b"
              strokeWidth={VOLTA_LINE_WIDTH}
              strokeDasharray={isEndSystem ? undefined : "4,4"}
            />

            {/* Volta number label — only on the start system, so multi-system
                voltas don't repeat the number on every row. */}
            {isStartSystem && (
              <text
                x={startX + VOLTA_LABEL_OFFSET}
                y={y - 4}
                fontSize="14"
                fontWeight="bold"
                fill="#991b1b"
                className="select-none"
              >
                {volta.voltaNumber}.
              </text>
            )}

            {/* Right-edge resize handle — only on the end system, since the
                drag target is the volta's actual end. */}
            {isEndSystem &&
              onVoltaResizeStart &&
              selectedTool === "volta" &&
              !voltaStart && (
                <g
                  className="volta-resize-handle"
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onVoltaResizeStart(volta.id, "end");
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Invisible larger hit target */}
                  <rect
                    x={endX - 8}
                    y={y - 4}
                    width={16}
                    height={VOLTA_HEIGHT + 8}
                    fill="transparent"
                  />
                  {/* Visible grip — small filled square at the corner */}
                  <rect
                    x={endX - 3}
                    y={y + VOLTA_HEIGHT - 6}
                    width={6}
                    height={6}
                    fill={isResizingThis ? "#dc2626" : "#991b1b"}
                    stroke="white"
                    strokeWidth={1}
                  />
                </g>
              )}

            {/* Live measure-count badge while resizing — only on the end
                system so multi-system voltas don't repeat the badge per row */}
            {isResizingThis && isEndSystem && (
              <text
                x={endX + 6}
                y={y - 4}
                fontSize="11"
                fontWeight="bold"
                fill="#dc2626"
                className="select-none"
              >
                {liveEndMeasure - volta.startMeasure === 1
                  ? "1 measure"
                  : `${liveEndMeasure - volta.startMeasure} measures`}
              </text>
            )}
          </g>
        );
      })}

      {/* Ghost preview shown between the two placement clicks */}
      {ghostGeometry && (
        <g className="volta-bracket-ghost" opacity={0.55} pointerEvents="none">
          <line
            x1={ghostGeometry.startX}
            y1={ghostGeometry.y}
            x2={ghostGeometry.endX}
            y2={ghostGeometry.y}
            stroke="#991b1b"
            strokeWidth={VOLTA_LINE_WIDTH}
            strokeDasharray="6,4"
          />
          <line
            x1={ghostGeometry.startX}
            y1={ghostGeometry.y}
            x2={ghostGeometry.startX}
            y2={ghostGeometry.y + VOLTA_HEIGHT}
            stroke="#991b1b"
            strokeWidth={VOLTA_LINE_WIDTH}
            strokeDasharray="6,4"
          />
          <line
            x1={ghostGeometry.endX}
            y1={ghostGeometry.y}
            x2={ghostGeometry.endX}
            y2={ghostGeometry.y + VOLTA_HEIGHT}
            stroke="#991b1b"
            strokeWidth={VOLTA_LINE_WIDTH}
            strokeDasharray="6,4"
          />
          <text
            x={ghostGeometry.startX + VOLTA_LABEL_OFFSET}
            y={ghostGeometry.y - 4}
            fontSize="12"
            fontWeight="bold"
            fill="#991b1b"
            className="select-none"
          >
            {ghostGeometry.measureCount === 1
              ? "1 measure"
              : `${ghostGeometry.measureCount} measures`}
          </text>
        </g>
      )}
    </g>
  );
}
