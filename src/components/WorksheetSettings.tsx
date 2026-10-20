import type { WorksheetConfig } from "../types/worksheet";
import { WORKSHEET_PRESETS } from "../lib/worksheetPresets";
import {
  LINE_SIZE_PRESETS,
  applyLineSizePreset,
  changeRowGap,
  changeWritingHeight,
  getRowGap,
  minimumRowGap,
} from "../lib/worksheetSizing";

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

  const gap = getRowGap(config);
  const activeSize = LINE_SIZE_PRESETS.find(
    (preset) =>
      preset.writingHeight === config.writingHeight &&
      preset.gap === gap
  );

  return (
    <div className="settings-body">
      <details className="settings-section" open>
        <summary className="section-label">
          <span>01</span> YOUR CONTENT
          <span className="section-caret" aria-hidden="true">⌄</span>
        </summary>
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
            Dotted letters follow your guidelines. Short phrases repeat;
            longer text flows onto the next writing row.
          </p>
        </div>
      </details>

      <details className="settings-section line-settings" open>
        <summary className="section-label">
          <span>02</span> WRITING LINES
          <span className="section-caret" aria-hidden="true">⌄</span>
        </summary>

        <div className="preset-label">Choose a writing size</div>
        <div className="line-size-options" aria-label="Writing size presets">
          {LINE_SIZE_PRESETS.map((preset) => {
            const active = activeSize?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={"line-size-option" + (active ? " is-active" : "")}
                aria-pressed={active}
                onClick={() => onChange(applyLineSizePreset(config, preset.id))}
              >
                <strong>{preset.label}</strong>
                <small>{preset.writingHeight} mm letters</small>
              </button>
            );
          })}
        </div>
        <p className="field-help size-note">
          Starting points, not standardized handwriting curriculum sizes. Fine-tune below.
        </p>

        <SliderField
          id="writing-height"
          label="Writing line size"
          help="Distance from the top guideline to the baseline. Lowercase letters use the middle line."
          value={config.writingHeight}
          min={8}
          max={24}
          onChange={(writingHeight) =>
            onChange(changeWritingHeight(config, writingHeight))
          }
        />
        <SliderField
          id="row-gap"
          label="Space between writing rows"
          help="LineNook protects extra room for letters that descend below the baseline."
          value={gap}
          min={minimumRowGap(config.writingHeight)}
          max={22}
          onChange={(rowGap) =>
            onChange(changeRowGap(config, rowGap))
          }
        />
        <div className="spacing-summary" aria-live="polite">
          <span className="spacing-miniature" aria-hidden="true">
            <i /><i /><i />
          </span>
          <span>
            <strong>{config.writingHeight} mm</strong> writing space +{" "}
            <strong>{gap} mm</strong> minimum gap.
            <small>We calculate the row height for you.</small>
          </span>
        </div>

        <SliderField
          id="page-margin"
          label="Page margins"
          help="Blank space around the edges of your US Letter sheet."
          value={config.margin}
          min={8}
          max={25}
          step={0.5}
          onChange={(margin) => update({ margin })}
        />

        <label className="toggle-row" htmlFor="fill-page">
          <span>
            <strong>Spread rows down the page</strong>
            <small>Uses leftover page space for extra gaps without changing letter size.</small>
          </span>
          <span className="switch">
            <input
              id="fill-page"
              type="checkbox"
              checked={config.fillPage}
              onChange={(event) => update({ fillPage: event.currentTarget.checked })}
            />
            <span className="switch-track" aria-hidden="true" />
          </span>
        </label>
        <label className="toggle-row highlight-toggle" htmlFor="show-trace">
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
      </details>

      <button className="reset-button" type="button" onClick={onReset}>
        <span aria-hidden="true">↺</span> Reset to defaults
      </button>
    </div>
  );
}

export default WorksheetSettings;
