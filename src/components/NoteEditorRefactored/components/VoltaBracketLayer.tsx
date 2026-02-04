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
}: VoltaBracketLayerProps) {
  if (voltaBrackets.length === 0) return null;

  // Calculate staff top position based on visible lines
  // Staff top varies: -2 * LINE_SPACING (5 lines), -1 * LINE_SPACING (4 lines), 0 (3 lines)
  const staffTopOffset =
    staffLines === 5
      ? -2 * LINE_SPACING
      : staffLines === 4
        ? -1 * LINE_SPACING
        : 0;
  const staffTopY = staffCenterY + staffTopOffset;

  // Render each volta bracket
  return (
    <g className="volta-brackets">
      {voltaBrackets.map((volta) => {
        // Find which system(s) this volta spans
        const startSystemIndex = Math.floor(
          volta.startMeasure / measuresPerRow,
        );
        const endSystemIndex = Math.floor(
          (volta.endMeasure - 1) / measuresPerRow,
        );

        // For now, only render voltas that fit on a single system
        // Multi-system volta rendering is more complex and can be added later
        if (startSystemIndex !== endSystemIndex) {
          console.warn(
            `Volta bracket ${volta.id} spans multiple systems - not yet supported`,
          );
          return null;
        }

        const systemLayout = systemLayouts[startSystemIndex];
        if (!systemLayout) return null;

        // Calculate X positions based on measure boundaries
        const startMeasureInSystem = volta.startMeasure % measuresPerRow;
        const endMeasureInSystem =
          ((volta.endMeasure - 1) % measuresPerRow) + 1;

        // Find measure X positions from layout
        const startMeasureInfo = systemLayout.measures[startMeasureInSystem];
        const endMeasureInfo = systemLayout.measures[endMeasureInSystem - 1];

        if (!startMeasureInfo || !endMeasureInfo) return null;

        // Calculate X coordinates from beat positions
        // MeasureInfo stores startBeatInSystem (beat offset), multiply by beatWidth for pixels
        const startX =
          LEFT_MARGIN +
          startMeasureInfo.startBeatInSystem * systemLayout.beatWidth;
        const endX =
          LEFT_MARGIN +
          (endMeasureInfo.startBeatInSystem + endMeasureInfo.beatsInMeasure) *
            systemLayout.beatWidth;

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
            {/* Horizontal line at top */}
            <line
              x1={startX}
              y1={y}
              x2={endX}
              y2={y}
              stroke="currentColor"
              strokeWidth={VOLTA_LINE_WIDTH}
              className="text-gray-700 dark:text-gray-300"
            />

            {/* Left vertical drop */}
            <line
              x1={startX}
              y1={y}
              x2={startX}
              y2={y + VOLTA_HEIGHT}
              stroke="currentColor"
              strokeWidth={VOLTA_LINE_WIDTH}
              className="text-gray-700 dark:text-gray-300"
            />

            {/* Right vertical drop (dashed to indicate continuation) */}
            <line
              x1={endX}
              y1={y}
              x2={endX}
              y2={y + VOLTA_HEIGHT}
              stroke="currentColor"
              strokeWidth={VOLTA_LINE_WIDTH}
              strokeDasharray="4,4"
              className="text-gray-700 dark:text-gray-300"
            />

            {/* Volta number label */}
            <text
              x={startX + VOLTA_LABEL_OFFSET}
              y={y - 4}
              fontSize="14"
              fontWeight="bold"
              fill="currentColor"
              className="text-gray-800 dark:text-gray-200 select-none"
            >
              {volta.voltaNumber}.
            </text>
          </g>
        );
      })}
    </g>
  );
}
