import { useState } from "react";
import type { WorksheetConfig, PracticeMode } from "../types/worksheet";
import type { SavedWorksheetPreset } from "../lib/worksheetStorage";
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
  savedPresets: readonly SavedWorksheetPreset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
  storageMessage: string;
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

type ChoiceProps<T extends string> = {
  id: string;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  help?: string;
  onChange: (value: T) => void;
};

function ChoiceField<T extends string>({
  id, label, value, options, help, onChange,
}: ChoiceProps<T>) {
  return (
    <div className="choice-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value}
        onChange={(event) => onChange(event.currentTarget.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {help && <p className="field-help">{help}</p>}
    </div>
  );
}

const MODES: readonly { id: PracticeMode; label: string; description: string }[] = [
  { id: "trace", label: "Trace", description: "Dotted guides for repeated tracing." },
  { id: "copy", label: "Copy", description: "A solid model with room to copy below." },
  { id: "fade", label: "Fade", description: "Prompts gradually lighten toward independent writing." },
  { id: "blank", label: "Blank", description: "Just the guidelines, with no letter prompts." },
];

function WorksheetSettings({
  config, onChange, onReset, savedPresets, onSavePreset, onLoadPreset,
  onDeletePreset, storageMessage,
}: Props) {
  const [presetName, setPresetName] = useState("");
  function update(patch: Partial<WorksheetConfig>) {
    onChange({ ...config, ...patch });
  }

  const gap = getRowGap(config);
  const activeSize = LINE_SIZE_PRESETS.find(
    (preset) => preset.writingHeight === config.writingHeight && preset.gap === gap
  );

  return (
    <div className="settings-body">
      <details className="settings-section" open>
        <summary className="section-label">
          <span>01</span> YOUR CONTENT
          <span className="section-caret" aria-hidden="true">⌄</span>
        </summary>
        <div className="preset-label">Start with a template</div>
        <div className="preset-grid" aria-label="Worksheet templates">
          {WORKSHEET_PRESETS.map((preset) => {
            const active = config.title === preset.title &&
              config.practiceText === preset.practiceText;
            return (
              <button key={preset.id} type="button"
                className={"preset-chip" + (active ? " is-active" : "")}
                aria-pressed={active}
                onClick={() => update({
                  title: preset.title, practiceText: preset.practiceText,
                })}>
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="text-field">
          <label htmlFor="worksheet-title">Worksheet title</label>
          <input id="worksheet-title" type="text" maxLength={70}
            value={config.title}
            onChange={(event) => update({ title: event.currentTarget.value })}
            placeholder="My Handwriting Practice" />
        </div>
        <div className="text-field">
          <label htmlFor="practice-text">Practice letters, words or phrase</label>
          <textarea id="practice-text" rows={3} maxLength={120}
            value={config.practiceText}
            onChange={(event) => update({ practiceText: event.currentTarget.value })}
            placeholder="Letters, words, or a short sentence..." />
          <p className="field-help">
            Edit freely; letter prompts and practice style can be adjusted below.
          </p>
        </div>
      </details>

      <details className="settings-section" open>
        <summary className="section-label">
          <span>02</span> PRACTICE SUPPORT
          <span className="section-caret" aria-hidden="true">⌄</span>
        </summary>
        <div className="preset-label">How should the student practice?</div>
        <div className="mode-options" role="group" aria-label="Practice support mode">
          {MODES.map((mode) => (
            <button key={mode.id} type="button"
              className={"mode-option" + (config.practiceMode === mode.id ? " is-active" : "")}
              aria-pressed={config.practiceMode === mode.id}
              title={mode.description}
              onClick={() => update({
                practiceMode: mode.id, showTrace: mode.id !== "blank",
              })}>
              {mode.label}
            </button>
          ))}
        </div>
        <p className="field-help mode-help">
          {MODES.find((mode) => mode.id === config.practiceMode)?.description}
        </p>

        <ChoiceField
          id="prompt-style" label="Practice prompts"
          value={config.promptStyle}
          options={[
            { value: "whole", label: "Whole word or phrase" },
            { value: "letter-by-letter", label: "One letter per row" },
          ]}
          help={config.promptStyle === "letter-by-letter"
            ? "Each character receives its own row. Trace and Fade repeat that letter along the line."
            : "Short phrases repeat; longer ones wrap down the page."}
          onChange={(promptStyle) => update({ promptStyle })}
        />
        <ChoiceField
          id="letter-case" label="Letter case"
          value={config.letterCase}
          options={[
            { value: "as-typed", label: "Keep as typed" },
            { value: "uppercase", label: "ALL UPPERCASE" },
            { value: "lowercase", label: "all lowercase" },
          ]}
          onChange={(letterCase) => update({ letterCase })}
        />
        <ChoiceField
          id="letter-form" label="Letterform variation"
          value={config.letterForm}
          options={[
            { value: "simple", label: "Simple manuscript" },
            { value: "rounded", label: "Alternate rounded a / g / t / I" },
          ]}
          help="Prototype teaching shapes, not a validated curriculum. Review letterforms before clinical use."
          onChange={(letterForm) => update({ letterForm })}
        />
        <ChoiceField
          id="writing-hand" label="Writing hand"
          value={config.writingHand}
          options={[
            { value: "right", label: "Right-handed / standard" },
            { value: "left", label: "Left-handed" },
          ]}
          help="In Copy mode, a left-handed setting places the reference on the right so the writing hand is less likely to obscure it."
          onChange={(writingHand) => update({ writingHand })}
        />
      </details>

      <details className="settings-section line-settings" open>
        <summary className="section-label">
          <span>03</span> WRITING LINES
          <span className="section-caret" aria-hidden="true">⌄</span>
        </summary>
        <div className="preset-label">Choose a writing size</div>
        <div className="line-size-options" aria-label="Writing size presets">
          {LINE_SIZE_PRESETS.map((preset) => {
            const active = activeSize?.id === preset.id;
            return (
              <button key={preset.id} type="button"
                className={"line-size-option" + (active ? " is-active" : "")}
                aria-pressed={active}
                onClick={() => onChange(applyLineSizePreset(config, preset.id))}>
                <strong>{preset.label}</strong>
                <small>{preset.writingHeight} mm letters</small>
              </button>
            );
          })}
        </div>
        <p className="field-help size-note">
          Adjustable starting points, not standardized handwriting curriculum sizes.
        </p>
        <SliderField
          id="writing-height" label="Writing line size"
          help="Top guideline to baseline; lowercase letters generally use the lower half."
          value={config.writingHeight} min={8} max={24}
          onChange={(writingHeight) => onChange(changeWritingHeight(config, writingHeight))}
        />
        <SliderField
          id="row-gap" label="Space between writing rows"
          help="Automatically reserves room for descending letters."
          value={gap} min={minimumRowGap(config.writingHeight)} max={22}
          onChange={(rowGap) => onChange(changeRowGap(config, rowGap))}
        />
        <div className="spacing-summary" aria-live="polite">
          <span className="spacing-miniature" aria-hidden="true"><i /><i /><i /></span>
          <span>
            <strong>{config.writingHeight} mm</strong> writing space +{" "}
            <strong>{gap} mm</strong> minimum gap.
            <small>We calculate your row height for you.</small>
          </span>
        </div>

        <ChoiceField
          id="line-style" label="Guideline style"
          value={config.lineStyle}
          options={[
            { value: "classic", label: "Classic — top / dashed middle / baseline" },
            { value: "color-cues", label: "Color cues — blue / purple / coral" },
            { value: "double", label: "Double line — top and baseline" },
            { value: "baseline", label: "Baseline only" },
          ]}
          onChange={(lineStyle) => update({ lineStyle })}
        />
        <ChoiceField
          id="paper-size" label="Paper size"
          value={config.paperSize}
          options={[
            { value: "letter", label: "US Letter · 8.5 × 11 in" },
            { value: "a4", label: "A4 · 210 × 297 mm" },
          ]}
          onChange={(paperSize) => update({ paperSize })}
        />
        <SliderField
          id="page-margin" label="Page margins"
          help="Blank space around the edges of the page."
          value={config.margin} min={8} max={25} step={0.5}
          onChange={(margin) => update({ margin })}
        />
        <label className="toggle-row" htmlFor="fill-page">
          <span>
            <strong>Spread rows down the page</strong>
            <small>Uses extra page space for gaps without stretching letters.</small>
          </span>
          <span className="switch">
            <input id="fill-page" type="checkbox"
              checked={config.fillPage}
              onChange={(event) => update({ fillPage: event.currentTarget.checked })} />
            <span className="switch-track" aria-hidden="true" />
          </span>
        </label>
        <label className="toggle-row highlight-toggle" htmlFor="highlight-baseline">
          <span>
            <strong>Highlight the baseline</strong>
            <small>In Classic, Double, or Baseline styles, use a warm baseline.</small>
          </span>
          <span className="switch">
            <input id="highlight-baseline" type="checkbox"
              checked={config.highlightBaseline}
              onChange={(event) => update({ highlightBaseline: event.currentTarget.checked })} />
            <span className="switch-track" aria-hidden="true" />
          </span>
        </label>
      </details>

      <details className="settings-section">
        <summary className="section-label">
          <span>04</span> PAGE HEADER
          <span className="section-caret" aria-hidden="true">⌄</span>
        </summary>
        <label className="toggle-row" htmlFor="show-name">
          <span>
            <strong>Name: __________</strong>
            <small>Include a blank student name field below the worksheet title.</small>
          </span>
          <span className="switch">
            <input id="show-name" type="checkbox"
              checked={config.showName}
              onChange={(event) => update({ showName: event.currentTarget.checked })} />
            <span className="switch-track" aria-hidden="true" />
          </span>
        </label>
        <label className="toggle-row highlight-toggle" htmlFor="show-date">
          <span>
            <strong>Date: __________</strong>
            <small>Include a blank date field for school or clinic use.</small>
          </span>
          <span className="switch">
            <input id="show-date" type="checkbox"
              checked={config.showDate}
              onChange={(event) => update({ showDate: event.currentTarget.checked })} />
            <span className="switch-track" aria-hidden="true" />
          </span>
        </label>
      </details>

      <details className="settings-section">
        <summary className="section-label">
          <span>05</span> MY SAVED SETUPS
          <span className="section-caret" aria-hidden="true">⌄</span>
        </summary>
        <p className="field-help saved-intro">
          Your current settings save automatically to this browser. Name a setup to reuse it later.
          Nothing is uploaded to an account.
        </p>
        <div className="save-preset-row">
          <label className="visually-hidden" htmlFor="saved-preset-name">
            Name for the saved worksheet setup
          </label>
          <input id="saved-preset-name" type="text" maxLength={40}
            placeholder="E.g. Pencil control practice"
            value={presetName}
            onChange={(event) => setPresetName(event.currentTarget.value)} />
          <button type="button" disabled={!presetName.trim()}
            onClick={() => {
              if (!presetName.trim()) return;
              onSavePreset(presetName.trim());
              setPresetName("");
            }}>
            Save
          </button>
        </div>
        <div className="saved-setup-list" aria-label="Saved worksheet setups">
          {savedPresets.length === 0 && (
            <p className="field-help">No named setups yet.</p>
          )}
          {savedPresets.map((preset) => (
            <div className="saved-setup-item" key={preset.id}>
              <span title={preset.name}>{preset.name}</span>
              <button type="button" onClick={() => onLoadPreset(preset.id)}
                aria-label={"Load " + preset.name}>Load</button>
              <button type="button" className="delete-preset"
                onClick={() => onDeletePreset(preset.id)}
                aria-label={"Delete " + preset.name}>×</button>
            </div>
          ))}
        </div>
        {storageMessage && <p className="storage-message" role="status">{storageMessage}</p>}
      </details>

      <button className="reset-button" type="button" onClick={onReset}>
        <span aria-hidden="true">↺</span> Reset to defaults
      </button>
    </div>
  );
}

export default WorksheetSettings;
