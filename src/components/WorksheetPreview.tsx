import type { Worksheet } from "../lib/buildWorksheet";

type Props = {
  worksheet: Worksheet;
};

/**
 * Draws a US Letter worksheet using the engine's millimeter coordinates.
 * The gray practice text is a visual sample, not a tracing font.
 */
function WorksheetPreview({ worksheet }: Props) {
  const { pageWidth, pageHeight, area, layout } = worksheet;
  const x1 = area.startX;
  const x2 = area.startX + area.width;
  const sample = worksheet.practiceText.replace(/\s+/g, " ").trim();

  return (
    <svg
      className="worksheet-svg"
      viewBox={`0 0 ${pageWidth} ${pageHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="worksheet-svg-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="worksheet-svg-title">
        {worksheet.title.trim() || "Handwriting worksheet"} — {layout.rows.length} practice rows
      </title>
      <defs>
        <clipPath id="worksheet-content-clip">
          <rect x={x1} y={0} width={area.width} height={pageHeight} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={pageWidth} height={pageHeight} fill="#fff" />

      <g clipPath="url(#worksheet-content-clip)">
        {worksheet.title.trim() && (
          <text
            x={x1}
            y={area.startY - 7}
            fill="#263d3b"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="700"
            fontSize={7.1}
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
          {sample && (
            <g clipPath="url(#worksheet-content-clip)">
              <text
                x={x1 + 2}
                y={row.baseline - 1.4}
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize={Math.min(16, (row.baseline - row.top) * 0.75)}
                fontWeight="400"
                fill="#b4c2c0"
                opacity={0.7}
              >
                {sample}
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

export default WorksheetPreview;
