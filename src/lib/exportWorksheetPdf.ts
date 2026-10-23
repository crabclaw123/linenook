import type { Worksheet } from "./buildWorksheet";
import { getWorksheetTitleSizeMm, getWorksheetTraceLayout } from "./traceLayout";
import { TRACE_STYLE, tracedColor } from "./traceStyle";
import { getGuidelineStrokes } from "./guidelineStyle";
import { getHeaderFields, getWorksheetTitleY } from "./headerFields";
import { HIGHLIGHT_COLORS } from "./textMarks";
import type { WordSpacingPrimitive } from "./wordSpacing";

/**
 * Small dependency-free vector PDF writer for a single worksheet.
 * All measurements originate in the same millimeter worksheet layout used by SVG.
 * Text titles use PDF's built-in Helvetica (basic Latin subset); practice letters
 * are our own dotted vector handwriting paths, not raster images.
 */
const PT_PER_MM = 72 / 25.4;
const pt = (mm: number) => Number((mm * PT_PER_MM).toFixed(3));
const num = (value: number) => Number(value.toFixed(3)).toString();
const coord = (worksheet: Worksheet, x: number, y: number) =>
  num(pt(x)) + " " + num(pt(worksheet.pageHeight - y));

function rgb(color: string): string {
  const components = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255);
  return components.map(num).join(" ");
}

function asciiTitle(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E]/g, "?");
}

function pdfLiteral(text: string): string {
  return asciiTitle(text).replace(/[\\()]/g, "\\$&");
}

function strokeLine(
  worksheet: Worksheet,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  widthMm: number,
  dashMm?: [number, number]
): string[] {
  return [
    "q",
    rgb(color) + " RG",
    num(pt(widthMm)) + " w",
    dashMm ? "[" + dashMm.map((d) => num(pt(d))).join(" ") + "] 0 d" : "[] 0 d",
    coord(worksheet, x1, y1) + " m",
    coord(worksheet, x2, y2) + " l S",
    "Q",
  ];
}

function wordSpacingCueToPdf(
  worksheet: Worksheet, cue: WordSpacingPrimitive
): string[] {
  if (cue.kind === "band") {
    return [
      "q", rgb(cue.color) + " rg",
      coord(worksheet, cue.x, cue.y + cue.height) + " " +
        num(pt(cue.width)) + " " + num(pt(cue.height)) + " re f",
      "Q",
    ];
  }
  if (cue.kind === "box") {
    return [
      "q", rgb(cue.color) + " RG", num(pt(cue.strokeWidth)) + " w",
      "[] 0 d",
      coord(worksheet, cue.x, cue.y + cue.height) + " " +
        num(pt(cue.width)) + " " + num(pt(cue.height)) + " re S",
      "Q",
    ];
  }
  if (cue.kind === "reminder") {
    return [
      "q", "BT",
      "/F2 " + num(pt(cue.fontSize)) + " Tf",
      rgb(cue.color) + " rg",
      coord(worksheet, cue.x, cue.y) + " Td",
      "(" + pdfLiteral(cue.text) + ") Tj",
      "ET", "Q",
    ];
  }

  // Cubic Bézier approximation of a vector circle (same center/radius as SVG).
  const k = 0.5522847498 * cue.radius;
  const { x, y, radius: r } = cue;
  const point = (px: number, py: number) => coord(worksheet, px, py);
  return [
    "q", rgb(cue.color) + " rg",
    point(x + r, y) + " m",
    point(x + r, y + k) + " " +
      point(x + k, y + r) + " " + point(x, y + r) + " c",
    point(x - k, y + r) + " " +
      point(x - r, y + k) + " " + point(x - r, y) + " c",
    point(x - r, y - k) + " " +
      point(x - k, y - r) + " " + point(x, y - r) + " c",
    point(x + k, y - r) + " " +
      point(x + r, y - k) + " " + point(x + r, y) + " c",
    "f", "Q",
  ];
}

function tracePathToPdf(
  worksheet: Worksheet,
  path: string,
  x: number,
  y: number,
  scale: number
): string[] {
  const tokens = path.match(/[MLQC]|-?(?:\d+\.?\d*|\.\d+)/g) ?? [];
  const instructions: string[] = [];
  let index = 0;
  let currentX = 0;
  let currentY = 0;

  function next(): number {
    const token = tokens[index++];
    if (token === undefined || !Number.isFinite(Number(token))) {
      throw new Error("Invalid handwriting vector path.");
    }
    return Number(token);
  }
  const pdfPoint = (px: number, py: number) =>
    coord(worksheet, x + px * scale, y + py * scale);

  while (index < tokens.length) {
    const command = tokens[index++];
    if (command === "M") {
      currentX = next();
      currentY = next();
      instructions.push(pdfPoint(currentX, currentY) + " m");
    } else if (command === "L") {
      currentX = next();
      currentY = next();
      instructions.push(pdfPoint(currentX, currentY) + " l");
    } else if (command === "C") {
      const x1 = next(), y1 = next(), x2 = next(), y2 = next();
      currentX = next();
      currentY = next();
      instructions.push(
        pdfPoint(x1, y1) + " " + pdfPoint(x2, y2) + " " +
        pdfPoint(currentX, currentY) + " c"
      );
    } else if (command === "Q") {
      const controlX = next(), controlY = next();
      const endX = next(), endY = next();
      const c1X = currentX + (2 / 3) * (controlX - currentX);
      const c1Y = currentY + (2 / 3) * (controlY - currentY);
      const c2X = endX + (2 / 3) * (controlX - endX);
      const c2Y = endY + (2 / 3) * (controlY - endY);
      instructions.push(
        pdfPoint(c1X, c1Y) + " " + pdfPoint(c2X, c2Y) + " " +
        pdfPoint(endX, endY) + " c"
      );
      currentX = endX;
      currentY = endY;
    } else {
      throw new Error("Unsupported handwriting vector command: " + command);
    }
  }
  return [...instructions, "S"];
}

function contentStream(worksheet: Worksheet): string {
  const commands: string[] = ["% LineNook vector handwriting worksheet"];
  const x1 = worksheet.area.startX;
  const x2 = x1 + worksheet.area.width;
  const tracing = getWorksheetTraceLayout(worksheet);

  // Print-highlight rectangles are genuine vector fills, not raster overlays.
  // Draw them first so guides and tracing remain legible on top.
  for (const row of tracing.rows) {
    for (const placement of row.placements) {
      if (!placement.highlight) continue;
      const heightMm = 8.9 * placement.scale;
      commands.push(
        "q",
        rgb(HIGHLIGHT_COLORS[placement.highlight]) + " rg",
        coord(worksheet, placement.x, placement.y + 0.55 * placement.scale + heightMm) +
          " " + num(pt((placement.glyph.width + 1.15) * placement.scale)) +
          " " + num(pt(heightMm)) + " re f",
        "Q"
      );
    }
  }

  // Draw word-spacing guidance beneath the guidelines and glyphs.
  for (const row of tracing.rows) {
    for (const cue of row.spacingCues ?? []) {
      commands.push(...wordSpacingCueToPdf(worksheet, cue));
    }
  }

  for (const row of worksheet.layout.rows) {
    for (const line of getGuidelineStrokes(
      row, worksheet.lineStyle, worksheet.highlightBaseline
    )) {
      commands.push(...strokeLine(
        worksheet, x1, line.y, x2, line.y, line.color,
        line.widthMm, line.dashMm
      ));
    }
  }

  // Clip titles and trace letters to the horizontal writable area.
  commands.push("q", coord(worksheet, x1, worksheet.pageHeight) + " " +
    num(pt(worksheet.area.width)) + " " + num(pt(worksheet.pageHeight)) + " re W n");

  if (worksheet.title.trim()) {
    const sizePt = pt(getWorksheetTitleSizeMm(worksheet));
    commands.push(
      "BT",
      "/F2 " + num(sizePt) + " Tf",
      rgb("#263d3b") + " rg",
      coord(worksheet, x1, getWorksheetTitleY(worksheet)) + " Td",
      "(" + pdfLiteral(worksheet.title) + ") Tj",
      "ET"
    );
  }

  for (const field of getHeaderFields(worksheet)) {
    commands.push(
      "BT", "/F2 " + num(pt(3.5)) + " Tf",
      rgb("#536b64") + " rg",
      coord(worksheet, field.labelX, field.textY) + " Td",
      "(" + field.label + ") Tj", "ET"
    );
    commands.push(...strokeLine(
      worksheet, field.lineStart, field.textY + 0.4,
      field.lineEnd, field.textY + 0.4, "#78918c", 0.3
    ));
  }

  if (worksheet.showTrace) {
    for (const row of tracing.rows) {
      for (const placement of row.placements) {
        commands.push(
          "q", "1 J", "1 j",
          rgb(tracedColor(placement.opacity)) + " RG",
          num(pt(TRACE_STYLE.strokeWidthMm)) + " w",
          placement.solid ? "[] 0 d" :
          "[" + num(pt(TRACE_STYLE.dotLengthMm)) + " " +
            num(pt(TRACE_STYLE.dotGapMm)) + "] 0 d"
        );
        for (const stroke of placement.glyph.strokes) {
          commands.push(...tracePathToPdf(
            worksheet, stroke, placement.x, placement.y, placement.scale
          ));
        }
        commands.push("Q");
      }
    }
  }
  commands.push("Q");
  return commands.join("\n") + "\n";
}

function assemblePdf(objects: string[]): Uint8Array {
  const encode = (text: string) => new TextEncoder().encode(text);
  const chunks = ["%PDF-1.4\n%LineNook\n"];
  const offsets = [0];
  let length = encode(chunks[0]).length;
  objects.forEach((obj, index) => {
    offsets.push(length);
    const section = String(index + 1) + " 0 obj\n" + obj + "\nendobj\n";
    chunks.push(section);
    length += encode(section).length;
  });
  const xrefStart = length;
  const xref = [
    "xref",
    "0 " + (objects.length + 1),
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => offset.toString().padStart(10, "0") + " 00000 n "),
    "trailer",
    "<< /Size " + (objects.length + 1) + " /Root 1 0 R >>",
    "startxref",
    String(xrefStart),
    "%%EOF",
    "",
  ].join("\n");
  chunks.push(xref);
  return encode(chunks.join(""));
}

export function createWorksheetPdf(worksheet: Worksheet): Uint8Array {
  const stream = contentStream(worksheet);
  const streamSize = new TextEncoder().encode(stream).length;
  const mediaWidth = pt(worksheet.pageWidth);
  const mediaHeight = pt(worksheet.pageHeight);

  return assemblePdf([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
      num(mediaWidth) + " " + num(mediaHeight) +
      "] /Resources << /Font << /F2 5 0 R >> >> /Contents 4 0 R >>",
    "<< /Length " + streamSize + " >>\nstream\n" + stream + "endstream",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ]);
}

export function worksheetPdfFilename(title: string): string {
  const slug = asciiTitle(title).toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  return "linenook-" + (slug || "worksheet") + ".pdf";
}
