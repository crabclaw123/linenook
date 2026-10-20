import type { WorksheetConfig } from "../types/worksheet";
import { WORKSHEET_PRESETS } from "../lib/worksheetPresets";

type Props = {
  config: WorksheetConfig;
  onChange: (config: WorksheetConfig) => void;
  onReset: () => void;
};

type SliderFieldProps = {
  id: string;
  label: string;
  help: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

function SliderField({
  id, label, help, value, min, max, step = 1, onChange,
}: SliderFieldProps) {
  return (
    <div className="slider-field">
      <div className="field-topline">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{value} mm</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
      <p className="field-help">{help}</p>
    </div>
  );
}

function WorksheetSettings({ config, onChange, onReset }: Props) {
  function update(patch: Partial<WorksheetConfig>) {
    onChange({ ...config, ...patch });
  }

  function updateRowHeight(rowHeight: number) {
    update({
      rowHeight,
      writingHeight: Math.min(config.writingHeight, rowHeight),
    });
  }

  return (
    <div className="settings-body">
      <div className="settings-section">
        <div className="section-label"><span>01</span> YOUR CONTENT</div>
        <div className="preset-label">Start with a template</div>
        <div className="preset-grid" aria-label="Worksheet presets">
          {WORKSHEET_PRESETS.map((preset) => {
            const active = config.title === preset.title &&
              config.practiceText === preset.practiceText;
            return (
              <button
                key={preset.id}
                type="button"
                className={"preset-chip" + (active ? " is-active" : "")}
                aria-pressed={active}
                onClick={() => update({
                  title: preset.title,
                  practiceText: preset.practiceText,
                })}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="text-field">
          <label htmlFor="worksheet-title">Worksheet title</label>
          <input
            id="worksheet-title"
            type="text"
            maxLength={70}
            value={config.title}
            onChange={(event) => update({ title: event.currentTarget.value })}
            placeholder="My Handwriting Practice"
          />
        </div>
        <div className="text-field">
          <label htmlFor="practice-text">Practice words or phrase</label>
          <textarea
            id="practice-text"
            rows={3}
            maxLength={120}
            value={config.practiceText}
            onChange={(event) => update({ practiceText: event.currentTarget.value })}
            placeholder="Letters, words, or a short sentence..."
          />
          <p className="field-help">
            Dotted, single-stroke letters appear directly on the writing lines.
            Short phrases repeat; longer text wraps onto additional rows.
          </p>
        </div>
      </div>

      <div className="settings-section line-settings">
        <div className="section-label"><span>02</span> PAGE & LINES</div>
        <SliderField
          id="writing-height"
          label="Writing line height"
          help="Space between the top guideline and baseline."
          value={config.writingHeight}
          min={8}
          max={Math.min(32, config.rowHeight)}
          onChange={(writingHeight) => update({ writingHeight })}
        />
        <SliderField
          id="row-height"
          label="Row height"
          help="Total space for each handwriting row, including the gap."
          value={config.rowHeight}
          min={20}
          max={48}
          onChange={updateRowHeight}
        />
        <SliderField
          id="page-margin"
          label="Page margins"
          help="Blank space around the edges of the page."
          value={config.margin}
          min={8}
          max={25}
          step={0.5}
          onChange={(margin) => update({ margin })}
        />
        <label className="toggle-row" htmlFor="show-trace">
          <span>
            <strong>Dotted tracing letters</strong>
            <small>Turn off for blank handwriting lines.</small>
          </span>
          <span className="switch">
            <input
              id="show-trace"
              type="checkbox"
              checked={config.showTrace}
              onChange={(event) => update({ showTrace: event.currentTarget.checked })}
            />
            <span className="switch-track" aria-hidden="true" />
          </span>
        </label>
        <label className="toggle-row highlight-toggle" htmlFor="highlight-baseline">
          <span>
            <strong>Highlight the baseline</strong>
            <small>Add a warm color to the bottom writing line.</small>
          </span>
          <span className="switch">
            <input
              id="highlight-baseline"
              type="checkbox"
              checked={config.highlightBaseline}
              onChange={(event) => update({ highlightBaseline: event.currentTarget.checked })}
            />
            <span className="switch-track" aria-hidden="true" />
          </span>
        </label>
      </div>
      <button className="reset-button" type="button" onClick={onReset}>
        <span aria-hidden="true">↺</span> Reset to defaults
      </button>
    </div>
  );
}

export default WorksheetSettings;
