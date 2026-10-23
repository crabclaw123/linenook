import type { Worksheet } from "../lib/buildWorksheet";
import { getWorksheetTitleSizeMm, getWorksheetTraceLayout } from "../lib/traceLayout";
import { TRACE_STYLE, tracedColor } from "../lib/traceStyle";
import { getGuidelineStrokes } from "../lib/guidelineStyle";
import { getHeaderFields, getWorksheetTitleY } from "../lib/headerFields";
import { HIGHLIGHT_COLORS } from "../lib/textMarks";
import type { WordSpacingPrimitive } from "../lib/wordSpacing";

function WordSpacingSvgCue({ cue }: { cue: WordSpacingPrimitive }) {
  switch (cue.kind) {
    case "band":
      return <rect x={cue.x} y={cue.y} width={cue.width}
        height={cue.height} fill={cue.color} />;
    case "dot":
      return <circle cx={cue.x} cy={cue.y} r={cue.radius} fill={cue.color} />;
    case "box":
      return <rect x={cue.x} y={cue.y} width={cue.width}
        height={cue.height} fill="none" stroke={cue.color}
        strokeWidth={cue.strokeWidth} rx={0.4} />;
    case "reminder":
      return <text x={cue.x} y={cue.y} fill={cue.color} fontSize={cue.fontSize}
        fontWeight="700" fontFamily="Arial, Helvetica, sans-serif">
        {cue.text}
      </text>;
  }
}


type Props = {
  worksheet: Worksheet;
  idPrefix?: string;
};

/** SVG and PDF use the same vector letter strokes, header geometry and guideline colors. */
function WorksheetPreview({ worksheet, idPrefix = "preview" }: Props) {
  const { pageWidth, pageHeight, area, layout } = worksheet;
  const x1 = area.startX;
  const x2 = area.startX + area.width;
  const clipId = idPrefix + "-content-clip";
  const titleId = idPrefix + "-worksheet-title";
  const traceLayout = getWorksheetTraceLayout(worksheet);
  const headerFields = getHeaderFields(worksheet);

  return (
    <svg
      className="worksheet-svg"
      viewBox={"0 0 " + pageWidth + " " + pageHeight}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={titleId}>
        {(worksheet.title.trim() || "Handwriting worksheet") + " — " + layout.rows.length + " practice rows"}
      </title>
      <defs>
        <clipPath id={clipId}>
          <rect x={x1} y={0} width={area.width} height={pageHeight} />
        </clipPath>
      </defs>
      <rect width={pageWidth} height={pageHeight} fill="#fff" />

      <g clipPath={"url(#" + clipId + ")"}>
        {worksheet.title.trim() && (
          <text
            x={x1}
            y={getWorksheetTitleY(worksheet)}
            fill="#263d3b"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="700"
            fontSize={getWorksheetTitleSizeMm(worksheet)}
          >
            {worksheet.title}
          </text>
        )}
        {headerFields.map((field) => (
          <g key={field.label}>
            <text
              x={field.labelX}
              y={field.textY}
              fill="#536b64"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize={3.5}
            >
              {field.label}
            </text>
            <line
              x1={field.lineStart}
              y1={field.textY + 0.4}
              x2={field.lineEnd}
              y2={field.textY + 0.4}
              stroke="#78918c"
              strokeWidth={0.3}
            />
          </g>
        ))}
      </g>

      {/* Put printable highlight behind both guideline and glyph strokes. */}
      <g clipPath={"url(#" + clipId + ")"}>
        {traceLayout.rows.flatMap((row, rowIndex) =>
          row.placements.filter((placement) => placement.highlight).map((placement, index) => (
            <rect
              key={"highlight-" + rowIndex + "-" + index}
              x={placement.x}
              y={placement.y + 0.55 * placement.scale}
              width={(placement.glyph.width + 1.15) * placement.scale}
              height={8.9 * placement.scale}
              fill={HIGHLIGHT_COLORS[placement.highlight!]}
            />
          ))
        )}
      </g>

      {/* All word-spacing cues use shared millimeter geometry with PDF. */}
      <g clipPath={"url(#" + clipId + ")"}>
        {traceLayout.rows.flatMap((row) => row.spacingCues ?? [])
          .map((cue, index) => <WordSpacingSvgCue cue={cue} key={index} />)}
      </g>

      {layout.rows.map((row, index) => (
        <g key={index}>
          {getGuidelineStrokes(row, worksheet.lineStyle, worksheet.highlightBaseline).map((line) => (
            <line
              key={line.position}
              x1={x1} x2={x2}
              y1={line.y} y2={line.y}
              stroke={line.color}
              strokeWidth={line.widthMm}
              strokeDasharray={line.dashMm?.join(" ")}
            />
          ))}
        </g>
      ))}

      <g clipPath={"url(#" + clipId + ")"}>
        {traceLayout.rows.flatMap((row, rowIndex) =>
          row.placements.flatMap((placement, glyphIndex) =>
            placement.glyph.strokes.map((path, pathIndex) => (
              <path
                key={rowIndex + "-" + glyphIndex + "-" + pathIndex}
                d={path}
                transform={
                  "translate(" + placement.x + " " + placement.y +
                  ") scale(" + placement.scale + ")"
                }
                stroke={tracedColor(placement.opacity)}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={TRACE_STYLE.strokeWidthMm / placement.scale}
                strokeDasharray={
                  placement.solid ? undefined :
                  (TRACE_STYLE.dotLengthMm / placement.scale) + " " +
                  (TRACE_STYLE.dotGapMm / placement.scale)
                }
              />
            ))
          )
        )}
      </g>
    </svg>
  );
}

export default WorksheetPreview;
