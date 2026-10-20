import type { Worksheet } from "../lib/buildWorksheet";
import { getWorksheetTitleSizeMm, getWorksheetTraceLayout } from "../lib/traceLayout";
import { TRACE_STYLE } from "../lib/traceStyle";

type Props = {
  worksheet: Worksheet;
  idPrefix?: string;
};

/** The worksheet's SVG and PDF use the same vector glyphs and millimeter geometry. */
function WorksheetPreview({ worksheet, idPrefix = "preview" }: Props) {
  const { pageWidth, pageHeight, area, layout } = worksheet;
  const x1 = area.startX;
  const x2 = area.startX + area.width;
  const clipId = idPrefix + "-content-clip";
  const titleId = idPrefix + "-worksheet-title";
  const traceLayout = getWorksheetTraceLayout(worksheet);

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
            y={area.startY - 7}
            fill="#263d3b"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="700"
            fontSize={getWorksheetTitleSizeMm(worksheet)}
          >
            {worksheet.title}
          </text>
        )}
      </g>

      {layout.rows.map((row, index) => (
        <g key={index}>
          <line
            x1={x1} x2={x2}
            y1={row.top} y2={row.top}
            stroke="#7998a0" strokeWidth={0.32}
          />
          <line
            x1={x1} x2={x2}
            y1={row.middle} y2={row.middle}
            stroke="#94aab1" strokeWidth={0.27}
            strokeDasharray="1.8 1.5"
          />
          <line
            x1={x1} x2={x2}
            y1={row.baseline} y2={row.baseline}
            stroke={worksheet.highlightBaseline ? "#df9869" : "#65858c"}
            strokeWidth={worksheet.highlightBaseline ? 0.65 : 0.4}
          />
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
                stroke={TRACE_STYLE.color}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={TRACE_STYLE.strokeWidthMm / placement.scale}
                strokeDasharray={
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
