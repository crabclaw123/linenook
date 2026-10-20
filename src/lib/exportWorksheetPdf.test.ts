import { describe, expect, it } from "vitest";
import { buildWorksheet } from "./buildWorksheet";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import { createWorksheetPdf, worksheetPdfFilename } from "./exportWorksheetPdf";

const decode = (data: Uint8Array) => new TextDecoder().decode(data);

describe("PDF worksheet export", () => {
  it("creates a US Letter, one-page, valid-xref-shaped vector PDF", () => {
    const pdf = decode(createWorksheetPdf(buildWorksheet(defaultWorksheetConfig)));
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf).toContain("/MediaBox [0 0 612 792]");
    expect(pdf).toContain("/Count 1");
    expect(pdf).toContain("xref\n0 6\n");
    expect(pdf).toContain("startxref\n");
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    expect(pdf).toContain("(My Handwriting Practice) Tj");
    expect(pdf).toContain(" c\n");
  });

  it("draws dotted tracing in trace mode and omits it for blank worksheets", () => {
    const visible = decode(createWorksheetPdf(buildWorksheet(defaultWorksheetConfig)));
    const blank = decode(createWorksheetPdf(buildWorksheet({
      ...defaultWorksheetConfig,
      showTrace: false,
    })));
    expect(visible.length).toBeGreaterThan(blank.length);
    expect(visible).toContain("1 J\n1 j");
    expect(blank).not.toContain("1 J\n1 j");
  });

  it("uses highlighted baseline color on request", () => {
    const normal = decode(createWorksheetPdf(buildWorksheet(defaultWorksheetConfig)));
    const highlighted = decode(createWorksheetPdf(buildWorksheet({
      ...defaultWorksheetConfig,
      highlightBaseline: true,
    })));
    expect(normal).not.toBe(highlighted);
  });

  it("escapes PDF control characters in the title and makes safe file names", () => {
    const worksheet = buildWorksheet({
      ...defaultWorksheetConfig,
      title: "Cam's (practice) \\sheet",
    });
    expect(decode(createWorksheetPdf(worksheet))).toContain("(Cam's \\(practice\\) \\\\sheet) Tj");
    expect(worksheetPdfFilename("My Name Practice!")).toBe("linenook-my-name-practice.pdf");
    expect(worksheetPdfFilename("")).toBe("linenook-worksheet.pdf");
  });
});
