import { useEffect, useState } from "react";
import WorksheetPreview from "./components/WorksheetPreview";
import WorksheetSettings from "./components/WorksheetSettings";
import { buildWorksheet } from "./lib/buildWorksheet";
import { defaultWorksheetConfig } from "./lib/defaultWorksheetConfig";
import { createWorksheetPdf, worksheetPdfFilename } from "./lib/exportWorksheetPdf";
import { getWorksheetTraceLayout } from "./lib/traceLayout";
import {
  loadCurrentConfig,
  loadSavedPresets,
  persistCurrentConfig,
  persistSavedPresets,
  type SavedWorksheetPreset,
} from "./lib/worksheetStorage";
import type { WorksheetConfig } from "./types/worksheet";
import "./App.css";

function App() {
  const [config, setConfig] = useState<WorksheetConfig>(loadCurrentConfig);
  const [savedPresets, setSavedPresets] = useState<SavedWorksheetPreset[]>(loadSavedPresets);
  const [storageMessage, setStorageMessage] = useState("");
  const worksheet = buildWorksheet(config);
  const tracing = getWorksheetTraceLayout(worksheet);

  useEffect(() => {
    persistCurrentConfig(config);
  }, [config]);

  function savePreset(name: string) {
    const sanitized = name.trim().slice(0, 40);
    if (!sanitized) return;
    const match = savedPresets.find(
      (item) => item.name.toLowerCase() === sanitized.toLowerCase()
    );
    const saved: SavedWorksheetPreset = {
      id: match?.id ?? (Date.now().toString(36) + "-" +
        Math.random().toString(36).slice(2, 9)),
      name: sanitized,
      savedAt: new Date().toISOString(),
      config: { ...config },
    };
    const next = [saved, ...savedPresets.filter((item) => item.id !== saved.id)]
      .slice(0, 20);
    if (persistSavedPresets(next)) {
      setSavedPresets(next);
      setStorageMessage(match ? "Setup updated in this browser." : "Setup saved in this browser.");
    } else {
      setStorageMessage("Browser storage is unavailable. Your setup was not saved.");
    }
  }

  function loadPreset(id: string) {
    const preset = savedPresets.find((item) => item.id === id);
    if (!preset) return;
    setConfig({ ...preset.config });
    setStorageMessage('Loaded "' + preset.name + '".');
  }

  function deletePreset(id: string) {
    const next = savedPresets.filter((item) => item.id !== id);
    if (persistSavedPresets(next)) {
      setSavedPresets(next);
      setStorageMessage("Saved setup deleted from this browser.");
    } else {
      setStorageMessage("Browser storage is unavailable. Could not delete setup.");
    }
  }

  function downloadPdf() {
    const bytes = createWorksheetPdf(worksheet);
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = worksheetPdfFilename(config.title);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return (
    <div className="app-shell">
      <style media="print">{"@page { size: " +
        (config.paperSize === "a4" ? "A4" : "letter") + "; margin: 0; }"}</style>

      <header className="site-header">
        <a className="brand" href="#studio" aria-label="LineNook, go to worksheet studio">
          <span className="brand-mark" aria-hidden="true">
            <span /><span /><span />
          </span>
          <span>LineNook<span className="brand-dot">.</span></span>
        </a>
        <span className="header-tag">
          Handwriting worksheet studio <span className="header-version">/ v0.3</span>
        </span>
      </header>

      <main id="studio" className="main-content">
        <div className="page-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> THE WORKSHEET STUDIO</div>
            <h1>A little space to <em>make progress.</em></h1>
            <p>Thoughtful handwriting practice for every learner. Choose a line size, adjust the level of support, and print a page made just for them.</p>
          </div>
          <div className="heading-note" aria-hidden="true">
            <span className="heading-note-line" />
            Made for little hands,<br />with a lot of care.
          </div>
        </div>

        <div className="studio-grid">
          <aside className="settings-panel" aria-label="Worksheet settings">
            <div className="panel-heading">
              <div className="panel-icon" aria-hidden="true">✎</div>
              <div>
                <h2>Make it yours</h2>
                <p>Every change updates the page.</p>
              </div>
            </div>
            <WorksheetSettings
              config={config}
              onChange={setConfig}
              onReset={() => setConfig({ ...defaultWorksheetConfig })}
              savedPresets={savedPresets}
              onSavePreset={savePreset}
              onLoadPreset={loadPreset}
              onDeletePreset={deletePreset}
              storageMessage={storageMessage}
            />
          </aside>

          <section className="preview-panel" aria-label="Live worksheet preview">
            <div className="preview-heading">
              <div>
                <div className="preview-label"><span className="live-dot" /> LIVE PREVIEW</div>
                <h2>Your worksheet</h2>
              </div>
              <span className="paper-pill">{worksheet.pageLabel}</span>
            </div>

            <div className="preview-stage">
              <div className="paper-frame">
                <WorksheetPreview worksheet={worksheet} idPrefix="preview" />
              </div>
            </div>

            {tracing.overflow && config.practiceMode !== "blank" && (
              <p className="worksheet-warning" role="status">
                Your practice text needs more rows than fit on this page. Shorten
                it, choose smaller writing lines, or change the prompt style.
              </p>
            )}
            {tracing.unsupportedCharacters.length > 0 &&
                config.showTrace && config.practiceMode !== "blank" && (
              <p className="worksheet-warning" role="status">
                The tracing alphabet does not yet include: {tracing.unsupportedCharacters.join(" ")}.
                Unsupported symbols appear as a question mark.
              </p>
            )}

            <div className="export-actions">
              <button type="button" className="primary-action" onClick={downloadPdf}>
                <span aria-hidden="true">↓</span> Download PDF
              </button>
              <button type="button" className="secondary-action" onClick={() => window.print()}>
                <span aria-hidden="true">⎙</span> Print worksheet
              </button>
            </div>

            <div className="preview-footer">
              <span><strong>{worksheet.layout.rows.length}</strong> writing rows on this page</span>
              <span className="preview-note">Vector quality · {worksheet.pageLabel}</span>
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <span>LineNook <span aria-hidden="true">✳</span> Room to grow, one line at a time.</span>
        <span>Built with care for OTs, teachers & families.</span>
      </footer>

      <div className="print-sheet" aria-hidden="true"
        style={{ width: worksheet.pageWidth + "mm", height: worksheet.pageHeight + "mm" }}>
        <WorksheetPreview worksheet={worksheet} idPrefix="print" />
      </div>
    </div>
  );
}

export default App;
