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

// Treble clef SVG path data
const TREBLE_CLEF_PATH =
  "m12.049 3.5296c0.305 3.1263-2.019 5.6563-4.0772 7.7014-0.9349 0.897-0.155 0.148-0.6437 0.594-0.1022-0.479-0.2986-1.731-0.2802-2.11 0.1304-2.6939 2.3198-6.5875 4.2381-8.0236 0.309 0.5767 0.563 0.6231 0.763 1.8382zm0.651 16.142c-1.232-0.906-2.85-1.144-4.3336-0.885-0.1913-1.255-0.3827-2.51-0.574-3.764 2.3506-2.329 4.9066-5.0322 5.0406-8.5394 0.059-2.232-0.276-4.6714-1.678-6.4836-1.7004 0.12823-2.8995 2.156-3.8019 3.4165-1.4889 2.6705-1.1414 5.9169-0.57 8.7965-0.8094 0.952-1.9296 1.743-2.7274 2.734-2.3561 2.308-4.4085 5.43-4.0046 8.878 0.18332 3.334 2.5894 6.434 5.8702 7.227 1.2457 0.315 2.5639 0.346 3.8241 0.099 0.2199 2.25 1.0266 4.629 0.0925 6.813-0.7007 1.598-2.7875 3.004-4.3325 2.192-0.5994-0.316-0.1137-0.051-0.478-0.252 1.0698-0.257 1.9996-1.036 2.26-1.565 0.8378-1.464-0.3998-3.639-2.1554-3.358-2.262 0.046-3.1904 3.14-1.7356 4.685 1.3468 1.52 3.833 1.312 5.4301 0.318 1.8125-1.18 2.0395-3.544 1.8325-5.562-0.07-0.678-0.403-2.67-0.444-3.387 0.697-0.249 0.209-0.059 1.193-0.449 2.66-1.053 4.357-4.259 3.594-7.122-0.318-1.469-1.044-2.914-2.302-3.792zm0.561 5.757c0.214 1.991-1.053 4.321-3.079 4.96-0.136-0.795-0.172-1.011-0.2626-1.475-0.4822-2.46-0.744-4.987-1.116-7.481 1.6246-0.168 3.4576 0.543 4.0226 2.184 0.244 0.577 0.343 1.197 0.435 1.812zm-5.1486 5.196c-2.5441 0.141-4.9995-1.595-5.6343-4.081-0.749-2.153-0.5283-4.63 0.8207-6.504 1.1151-1.702 2.6065-3.105 4.0286-4.543 0.183 1.127 0.366 2.254 0.549 3.382-2.9906 0.782-5.0046 4.725-3.215 7.451 0.5324 0.764 1.9765 2.223 2.7655 1.634-1.102-0.683-2.0033-1.859-1.8095-3.227-0.0821-1.282 1.3699-2.911 2.6513-3.198 0.4384 2.869 0.9413 6.073 1.3797 8.943-0.5054 0.1-1.0211 0.143-1.536 0.143z";

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
          transform={`translate(0, ${staffCenterY - 96}) scale(5.1)`}
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

      {/* System number label */}
      <text
        x={15}
        y={staffCenterY + clipTopOffset - 10}
        fontSize={14}
        fill="#94a3b8"
        fontWeight="bold"
      >
        {systemIndex + 1}
      </text>
    </g>
  );
}
