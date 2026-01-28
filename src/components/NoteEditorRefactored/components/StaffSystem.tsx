// src/components/NoteEditorRefactored/components/StaffSystem.tsx
// Renders a single staff system with clef, time signature, bar lines, and beat shading

import React from "react";
import {
  LEFT_MARGIN,
  STAFF_LEFT,
  LINE_SPACING,
  getNoteOffset,
  getStaffCenterY,
} from "@/lib/layoutUtils";
import {
  getLayoutForSystem,
  getBeatXInSystem,
  SystemLayout,
} from "../utils/systemLayout";
import { TimeSignature } from "../utils/timeSigConfig";

export interface StaffSystemProps {
  systemIndex: number;
  systemLayouts: SystemLayout[];
  staffLines: number;
  timeSignature: TimeSignature;
  readOnly: boolean;
  onTimeSignatureClick?: () => void;
}

// Treble clef SVG path data (optimized via Inkscape + SVGOMG)
const TREBLE_CLEF_PATH =
  "M7.942 11.231c-.922.911-.155.148-.644.594-.102-.479-.299-1.73-.28-2.11.13-2.693 2.32-6.587 4.238-8.023 1.044 1.95 2.024 4.262-3.314 9.54m4.728 8.441c-1.232-.906-2.85-1.144-4.334-.885l-.574-3.764c2.35-2.329 4.78-5.65 5.04-8.54S12.528 1.814 11.126 0c-1.7.128-3.058 1.884-3.802 3.417-1.283 2.643-1.141 5.916-.57 8.796-.81.952-1.148 1.082-2.727 2.734-1.58 1.652-4.299 5.485-4.005 8.878s2.592 6.424 5.87 7.227a8.9 8.9 0 0 0 3.824.099c.22 2.25 1.096 4.66.093 6.813-.9 1.933-2.83 3.034-4.81 1.94 1.069-.257 1.975-1.049 2.26-1.565.813-1.477-.143-3.522-2.156-3.358S1.934 38.1 3.366 39.666c1.37 1.499 3.725 1.405 5.43.318s2.042-3.512 1.903-4.86-.473-3.372-.514-4.089c7.072-2.527 5.36-9.357 2.485-11.363m-2.518 10.717c-.482-3.03-.925-5.962-1.379-8.956 1.625-.168 3.162-.005 4.023 2.184s-.086 5.965-2.644 6.772m-2.07.236c-2.545.117-4.942-1.76-5.634-4.081s-.49-4.603.82-6.504c1.155-1.676 2.607-3.105 4.03-4.543l.548 3.382c-6.058 2.499-4.036 9.695-.45 9.085-3.399-2.107-1.448-5.912.843-6.425.438 2.869.94 6.073 1.38 8.943-.506.1-1.022.12-1.537.143";

/**
 * StaffSystem - Renders a single staff system
 */
export function StaffSystem({
  systemIndex,
  systemLayouts,
  staffLines,
  timeSignature,
  readOnly,
  onTimeSignatureClick,
}: StaffSystemProps) {
  const isFirstSystem = systemIndex === 0;
  const staffCenterY = getStaffCenterY(systemIndex);

  // Dynamic staff extents based on visible lines
  const staffTopOffset =
    staffLines === 5
      ? -2 * LINE_SPACING
      : staffLines === 4
        ? -1 * LINE_SPACING
        : 0;
  const staffBottomOffset = 2 * LINE_SPACING;
  const staffPadding = 20;

  // Visual center for decorations
  const visibleCenterOffset = (staffTopOffset + staffBottomOffset) / 2;
  const decorationSpread =
    staffLines === 5
      ? LINE_SPACING
      : staffLines === 4
        ? LINE_SPACING * 0.875
        : LINE_SPACING / 2;

  // Clip area
  const clipTopOffset = staffTopOffset - 1.5 * LINE_SPACING;

  // Get per-system layout
  const sysLayout = getLayoutForSystem(systemLayouts, systemIndex);
  const sysTotalBeats = sysLayout.totalBeats;
  const sysBeatWidth = sysLayout.beatWidth;
  const sysMeasures = sysLayout.measures;
  const sysStaffRight = sysLayout.staffRight;

  return (
    <g key={`system-${systemIndex}`}>
      {/* Clip path */}
      <defs>
        <clipPath id={`system-clip-${systemIndex}`}>
          <rect
            x={0}
            y={staffCenterY + clipTopOffset}
            width={sysLayout.svgWidth}
            height={staffBottomOffset - clipTopOffset + 120}
          />
        </clipPath>
      </defs>

      {/* Beat shading */}
      {sysMeasures.flatMap((measure) =>
        Array.from({ length: measure.beatsInMeasure }, (_, beatInMeasure) => {
          const beatInSystem = measure.startBeatInSystem + beatInMeasure;
          const beatX =
            LEFT_MARGIN + measure.xOffset + beatInMeasure * sysBeatWidth;
          const isShaded = beatInSystem % 2 === 1;
          return (
            <rect
              key={`shade-${systemIndex}-${beatInSystem}`}
              x={beatX}
              y={staffCenterY + staffTopOffset - staffPadding}
              width={sysBeatWidth}
              height={staffBottomOffset - staffTopOffset + staffPadding * 2}
              fill={isShaded ? "#e2e8f0" : "#f8fafc"}
            />
          );
        }),
      )}

      {/* Staff lines */}
      {(() => {
        const allLineOffsets = [
          -2 * LINE_SPACING,
          -1 * LINE_SPACING,
          0,
          1 * LINE_SPACING,
          2 * LINE_SPACING,
        ];
        const linesToShow =
          staffLines === 5
            ? [0, 1, 2, 3, 4]
            : staffLines === 4
              ? [1, 2, 3, 4]
              : [2, 3, 4];
        return linesToShow.map((lineIndex) => (
          <line
            key={`staff-line-${lineIndex}`}
            x1={STAFF_LEFT}
            y1={staffCenterY + allLineOffsets[lineIndex]}
            x2={sysStaffRight}
            y2={staffCenterY + allLineOffsets[lineIndex]}
            stroke="#4a5568"
            strokeWidth={2}
          />
        ));
      })()}

      {/* Bar lines */}
      {[...sysMeasures, null].map((measure, measureIndex) => {
        const isLastBarLine = measure === null;
        let barX: number;
        if (isLastBarLine) {
          const lastMeasure = sysMeasures[sysMeasures.length - 1];
          barX =
            LEFT_MARGIN +
            lastMeasure.xOffset +
            lastMeasure.beatsInMeasure * sysBeatWidth +
            lastMeasure.suffixWidth;
        } else {
          barX = LEFT_MARGIN + measure.xOffset - measure.prefixWidth;
        }
        const isEdge = measureIndex === 0 || isLastBarLine;

        return (
          <g key={`bar-${systemIndex}-${measureIndex}`}>
            <line
              x1={barX}
              y1={staffCenterY + staffTopOffset - 8}
              x2={barX}
              y2={staffCenterY + staffBottomOffset + 8}
              stroke={isEdge ? "#1e293b" : "#475569"}
              strokeWidth={isEdge ? 4 : 2}
            />

            {/* Time signature display at mid-row changes */}
            {measure?.showTimeSig && measureIndex !== 0 && (
              <g>
                <text
                  x={barX + 15}
                  y={staffCenterY + visibleCenterOffset - decorationSpread + 6}
                  fontSize={20}
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#334155"
                >
                  {measure.timeSignature.numerator}
                </text>
                <text
                  x={barX + 15}
                  y={staffCenterY + visibleCenterOffset + decorationSpread + 6}
                  fontSize={20}
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#334155"
                >
                  {measure.timeSignature.denominator}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Treble Clef */}
      <g clipPath={`url(#system-clip-${systemIndex})`}>
        <g
          transform={`translate(0, ${staffCenterY - 98}) scale(5.2)`}
          style={{ pointerEvents: "none" }}
        >
          <path d={TREBLE_CLEF_PATH} fill="#334155" />
        </g>
      </g>

      {/* Time signature (first system only) */}
      {isFirstSystem && (
        <g
          onClick={(e) => {
            if (!readOnly && onTimeSignatureClick) {
              e.stopPropagation();
              onTimeSignatureClick();
            }
          }}
          style={{ cursor: readOnly ? "default" : "pointer" }}
        >
          <rect
            x={70}
            y={staffCenterY + staffTopOffset}
            width={30}
            height={staffBottomOffset - staffTopOffset}
            fill="transparent"
          />
          <text
            x={85}
            y={staffCenterY + visibleCenterOffset - decorationSpread + 6}
            fontSize={20}
            fontWeight="bold"
            textAnchor="middle"
            fill="#334155"
          >
            {timeSignature.numerator}
          </text>
          <text
            x={85}
            y={staffCenterY + visibleCenterOffset + decorationSpread + 6}
            fontSize={20}
            fontWeight="bold"
            textAnchor="middle"
            fill="#334155"
          >
            {timeSignature.denominator}
          </text>
        </g>
      )}

      {/* Beat numbers */}
      {Array.from({ length: sysTotalBeats }, (_, i) => i).map((beatIndex) => (
        <text
          key={`beat-${systemIndex}-${beatIndex}`}
          x={
            getBeatXInSystem(sysLayout, beatIndex) + getNoteOffset(sysBeatWidth)
          }
          y={staffCenterY + staffBottomOffset + 25}
          fontSize={11}
          textAnchor="middle"
          fill="#64748b"
        >
          {sysLayout.startBeat + beatIndex + 1}
        </text>
      ))}

      {/* System number label - hidden when only 1 row */}
      {systemLayouts.length > 1 && (
        <text
          x={5}
          y={staffCenterY + clipTopOffset + 14}
          fontSize={14}
          fill="#94a3b8"
          fontWeight="bold"
        >
          {systemIndex + 1}
        </text>
      )}
    </g>
  );
}
