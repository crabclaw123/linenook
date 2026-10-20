import type { WorksheetConfig } from "../types/worksheet";

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
          <p className="field-help">Shown in light gray as a sample on each line. Tracing fonts come later.</p>
        </div>
      </div>

      <div className="settings-section line-settings">
        <div className="section-label"><span>02</span> PAGE & LINES</div>
        <SliderField
          id="writing-height"
          label="Writing line height"
          help="Space between the top line and baseline."
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
        <label className="toggle-row" htmlFor="highlight-baseline">
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
