import { useRef, useState } from "react";
import type { WorksheetConfig, PracticeMode, HighlightTone } from "../types/worksheet";
import { ACTIVITY_TEMPLATES, ACTIVITY_CATEGORIES, applyActivityTemplate,
  type ActivityCategory } from "../lib/activityTemplates";
import { PREWRITING_SHAPES } from "../lib/prewritingShapes";
import { applyTextStyle, rebaseTextMarks } from "../lib/textMarks";
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
  availableRows: number;
  onChange: (config: WorksheetConfig) => void;
  onReset: () => void;
  savedPresets: readonly SavedWorksheetPreset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
  storageMessage: string;
  onExportPreset: (name: string, config: WorksheetConfig) => void;
  onImportPreset: (file: File) => Promise<void>;
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
  { id: "trace", label: "Trace", description: "Repeat the whole phrase, including wrapped lines, throughout the available rows." },
  { id: "copy", label: "Copy", description: "A solid model with room to copy below." },
  { id: "fade", label: "Fade", description: "Repeat the same complete phrase with progressively lighter letters. Reserve blank rows below for independent practice." },
  { id: "blank", label: "Blank", description: "Just the guidelines, with no letter prompts." },
];

function WorksheetSettings({
  config, availableRows, onChange, onReset, savedPresets, onSavePreset, onLoadPreset,
  onDeletePreset, storageMessage, onExportPreset, onImportPreset,
}: Props) {
  const [presetName, setPresetName] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("Names & sentences");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const importInput = useRef<HTMLInputElement>(null);
  function update(patch: Partial<WorksheetConfig>) {
    onChange({ ...config, ...patch });
  }

  function updatePracticeText(value: string) {
    onChange({
      ...config,
      practiceText: value,
      textMarks: rebaseTextMarks(config.textMarks, config.practiceText, value),
    });
    setSelection({ start: 0, end: 0 });
  }

  const selected = selection.end > selection.start &&
    selection.end <= config.practiceText.length;
  const selectedText = selected
    ? config.practiceText.slice(selection.start, selection.end) : "";

  function styleSelection(edit: {
    mode?: PracticeMode | null;
    highlight?: HighlightTone | null;
  }) {
    if (!selected) return;
    update({
      textMarks: applyTextStyle(
        config.textMarks, config.practiceText.length,
        selection.start, selection.end, edit
      ),
      showTrace: true,
    });
  }

  const gap = getRowGap(config);
  // Keep at least one row available for an example; Blank mode is available
  // when the entire page should have no tracing.
  const maxBlankRows = Math.max(0, availableRows - 1);
  const visibleBlankRows = Math.min(config.blankPracticeRows, maxBlankRows);
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
                  activityType: "text",
                  title: preset.title, practiceText: preset.practiceText,
                  textMarks: [],
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
        <div className="choice-field">
          <label htmlFor="activity-type">Worksheet activity</label>
          <select id="activity-type" value={config.activityType}
            onChange={(event) => update({
              activityType: event.currentTarget.value as WorksheetConfig["activityType"],
              showTrace: true,
            })}>
            <option value="text">Letters, words and sentences</option>
            <option value="shapes">Prewriting shapes and lines</option>
          </select>
        </div>

        {config.activityType === "shapes" ? (
          <div className="choice-field">
            <label htmlFor="shape-selector">Choose a shape or path</label>
            <select id="shape-selector" value={config.shapeId}
              onChange={(event) => update({
                shapeId: event.currentTarget.value as WorksheetConfig["shapeId"],
              })}>
              {Object.entries(PREWRITING_SHAPES).map(([id, shape]) => (
                <option key={id} value={id}>{shape.label} — {shape.description}</option>
              ))}
            </select>
            <p className="field-help">
              Shape practice follows the same tracing, copying, fading and spacing
              rules as handwriting. Preview and PDF use matching vector paths.
            </p>
          </div>
        ) : (
          <>
            <div className="text-field">
              <label htmlFor="practice-text">Practice letters, words or phrase</label>
              <textarea id="practice-text" rows={3} maxLength={120}
                value={config.practiceText}
                onChange={(event) => updatePracticeText(event.currentTarget.value)}
                onSelect={(event) => setSelection({
                  start: event.currentTarget.selectionStart,
                  end: event.currentTarget.selectionEnd,
                })}
                placeholder="Letters, words, or a short sentence..." />
              <p className="field-help">
                Select a word or phrase in this box to highlight it or assign
                a different tracing/copying level. Selections follow wrapped
                and repeated text.
              </p>
            </div>
            <div className="text-style-panel">
              <strong className="text-style-heading">Customize selected text</strong>
              <p className="selection-readout" aria-live="polite">
                {selected
                  ? "Selected: “" + selectedText.slice(0, 45) + "”"
                  : "Select text above to enable these controls."}
              </p>
              <span className="style-toolbar-label">Highlight color</span>
              <div className="text-style-actions">
                {(["yellow", "mint", "peach"] as const).map((tone) => (
                  <button key={tone} type="button" disabled={!selected}
                    className={"highlight-action highlight-" + tone}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => styleSelection({ highlight: tone })}
                    aria-label={"Highlight selected text " + tone}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
                <button type="button" disabled={!selected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => styleSelection({ highlight: null })}>
                  Remove color
                </button>
              </div>
              <span className="style-toolbar-label">Practice mode for selection</span>
              <div className="text-style-actions">
                {(["trace", "copy", "fade", "blank"] as const).map((mode) => (
                  <button key={mode} type="button" disabled={!selected}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => styleSelection({ mode })}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
                <button type="button" disabled={!selected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => styleSelection({ mode: null, highlight: null })}>
                  Clear styles
                </button>
              </div>
              {config.textMarks.length > 0 && (
                <div className="text-style-mark-list">
                  <span className="style-toolbar-label">Styled parts</span>
                  {config.textMarks.map((mark, index) => (
                    <div className="text-style-mark" key={index}>
                      <span>
                        “{config.practiceText.slice(mark.start, mark.end)}”
                        <small>{mark.mode ?? "Default mode"}{mark.highlight
                          ? " · " + mark.highlight : ""}</small>
                      </span>
                      <button type="button"
                        aria-label={"Clear styling from " +
                          config.practiceText.slice(mark.start, mark.end)}
                        onClick={() => update({
                          textMarks: applyTextStyle(
                            config.textMarks, config.practiceText.length,
                            mark.start, mark.end, { mode: null, highlight: null }
                          ),
                        })}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <p className="field-help">
                Editing styled words removes affected annotations rather than
                accidentally attaching them to different words.
              </p>
            </div>
          </>
        )}
      </details>

      <details className="settings-section">
        <summary className="section-label">
          <span>02</span> ACTIVITY LIBRARY
          <span className="section-caret" aria-hidden="true">⌄</span>
        </summary>
        <p className="field-help library-intro">
          Ready-to-edit name writing, sentence copying, letter progressions,
          themed prompts and prewriting shapes.
        </p>
        <div className="library-categories" role="group" aria-label="Activity category">
          {ACTIVITY_CATEGORIES.map((option) => (
            <button key={option} type="button"
              className={category === option ? "is-active" : ""}
              aria-pressed={category === option}
              onClick={() => setCategory(option)}>{option}</button>
          ))}
        </div>
        <div className="activity-list">
          {ACTIVITY_TEMPLATES.filter((template) => template.category === category)
            .map((template) => (
              <button key={template.id} type="button"
                onClick={() => {
                  onChange(applyActivityTemplate(config, template));
                  setSelection({ start: 0, end: 0 });
                }}>
                <strong>{template.label}</strong>
                <small>{template.description}</small>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
        </div>
      </details>

      <details className="settings-section" open>
        <summary className="section-label">
          <span>03</span> PRACTICE SUPPORT
          <span className="section-caret" aria-hidden="true">⌄</span>
        </summary>
        <div className="preset-label">Default support for the worksheet</div>
        <p className="field-help mode-intro">
          This controls the overall pattern. For text activities, you can
          override individual words using the selection tools above.
        </p>
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
            : "Entire phrases repeat, even when they wrap across multiple rows."}
          onChange={(promptStyle) => update({ promptStyle })}
        />

        <div className="blank-practice-control">
          <div className="field-topline">
            <label htmlFor="blank-practice-rows">Blank rows for independent practice</label>
            <output htmlFor="blank-practice-rows">
              {visibleBlankRows} {visibleBlankRows === 1 ? "row" : "rows"}
            </output>
          </div>
          <input
            id="blank-practice-rows"
            type="range"
            min={0}
            max={maxBlankRows}
            step={1}
            value={visibleBlankRows}
            disabled={config.practiceMode === "blank" || maxBlankRows === 0}
            onChange={(event) => update({
              blankPracticeRows: Number(event.currentTarget.value),
            })}
          />
          <p className="field-help">
            {config.promptStyle === "letter-by-letter"
              ? "Keep these rows blank at the bottom for independent letter practice."
              : "Complete phrases repeat above these blank rows. If another full phrase won't fit, the remaining row stays blank too."}
            {config.practiceMode === "copy"
              ? " Copy mode already leaves rows blank after the model." : ""}
          </p>
        </div>

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
          <span>04</span> WRITING LINES
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
        <SliderField
          id="character-spacing"
          label="Extra space between characters"
          help="Adds room between letters and symbols without changing their size. At 0 mm, the original spacing is preserved. Longer text wraps automatically."
          value={config.characterSpacing}
          min={0}
          max={8}
          step={0.5}
          onChange={(characterSpacing) => update({ characterSpacing })}
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
          <span>05</span> PAGE HEADER
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
          <span>06</span> MY SAVED SETUPS
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
              <button type="button" onClick={() => onExportPreset(preset.name, preset.config)}
                aria-label={"Export " + preset.name}>Export</button>
              <button type="button" className="delete-preset"
                onClick={() => onDeletePreset(preset.id)}
                aria-label={"Delete " + preset.name}>×</button>
            </div>
          ))}
        </div>
        <div className="preset-transfer-actions">
          <button type="button" onClick={() =>
            onExportPreset(presetName.trim() || config.title || "My worksheet", config)}>
            ↓ Export current worksheet (.json)
          </button>
          <button type="button" onClick={() => importInput.current?.click()}>
            ↑ Import shared worksheet (.json)
          </button>
          <input
            className="visually-hidden"
            ref={importInput}
            type="file"
            accept=".json,application/json"
            aria-label="Import a LineNook worksheet preset JSON file"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void onImportPreset(file);
              event.currentTarget.value = "";
            }}
          />
        </div>
        <p className="field-help">
          Share a JSON file with another LineNook user. Text highlights, mixed
          practice modes, shapes and paper settings are included.
        </p>
        {storageMessage && <p className="storage-message" role="status">{storageMessage}</p>}
      </details>

      <button className="reset-button" type="button" onClick={onReset}>
        <span aria-hidden="true">↺</span> Reset to defaults
      </button>
    </div>
  );
}

export default WorksheetSettings;
