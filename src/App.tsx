import { useState } from "react";
import WorksheetPreview from "./components/WorksheetPreview";
import WorksheetSettings from "./components/WorksheetSettings";
import { buildWorksheet } from "./lib/buildWorksheet";
import { defaultWorksheetConfig } from "./lib/defaultWorksheetConfig";
import type { WorksheetConfig } from "./types/worksheet";
import "./App.css";

function App() {
  const [config, setConfig] = useState<WorksheetConfig>(() => ({
    ...defaultWorksheetConfig,
  }));
  const worksheet = buildWorksheet(config);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#studio" aria-label="LineNook, go to worksheet studio">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>LineNook<span className="brand-dot">.</span></span>
        </a>
        <span className="header-tag">Handwriting worksheet studio <span className="header-version">/ v0.1</span></span>
      </header>

      <main id="studio" className="main-content">
        <div className="page-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> THE WORKSHEET STUDIO</div>
            <h1>A little space to <em>make progress.</em></h1>
            <p>Thoughtful handwriting practice for every learner. Customize the lines, add your words, and see the page take shape.</p>
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
            />
          </aside>

          <section className="preview-panel" aria-label="Live worksheet preview">
            <div className="preview-heading">
              <div>
                <div className="preview-label"><span className="live-dot" /> LIVE PREVIEW</div>
                <h2>Your worksheet</h2>
              </div>
              <span className="paper-pill">US Letter · 8.5 × 11 in</span>
            </div>

            <div className="preview-stage">
              <div className="paper-frame">
                <WorksheetPreview worksheet={worksheet} />
              </div>
            </div>

            <div className="preview-footer">
              <span><strong>{worksheet.layout.rows.length}</strong> writing rows on this page</span>
              <span className="preview-note">Preview only · PDF export coming next</span>
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <span>LineNook <span aria-hidden="true">✳</span> Room to grow, one line at a time.</span>
        <span>Built with care for OTs, teachers & families.</span>
      </footer>
    </div>
  );
}

export default App;
