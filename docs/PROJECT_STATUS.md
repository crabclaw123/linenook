# LineNook — Project Status

**Updated:** October 22, 2026  
**Product:** Browser-based printable handwriting and prewriting worksheet studio for occupational therapists, educators, and families.

## Current development

- **Phase 1 and Phase 2:** Merged into `main`.
- **QA stabilization:** Wrapped-phrase repetition, reserved independent-writing rows, independently scrolling desktop settings, and larger always-visible preview were implemented on `qa/bug-cleanup-1` and are included in the Phase 3 branch. They are not necessarily in `main` until merged.
- **Phase 3:** Visual practice tools, worksheet activity library, portable presets and **word-spacing intervention supports** are implemented on `feature/visual-practice-tools`. The previous 84-test suite passed; new word-spacing tests require verification on the latest commit. Hands-on QA remains required before merging.
- **New Phase 3 follow-up (not implemented):** Multiple different shapes on one page, plus worksheets that intermix shapes with letters, numbers and other writing activities. These were added to the roadmap in the user's latest push and are explicitly **backlog**, not completed Phase 3 functionality.
- **Phase 4:** Not started.

## Technology

React, TypeScript, Vite, Vitest and ESLint. SVG live preview and dependency-free one-page vector PDF share physical millimeter-based geometry. Browser-local settings and named presets; no backend or user account.

## Delivered by previous phases

- Responsive two-panel editor; independent settings scrolling on desktop; printable live SVG and vector PDF in US Letter or A4.
- Text templates, original letterforms, letter size/row-gap/margins and optional Name/Date fields.
- Trace, Copy, Fade, Blank, letter-by-letter and case control, visual guideline styles, per-character spacing.
- Whole phrase repetition, including wrapped multi-row phrases; reserve blank independent-practice rows, and avoid cutting off partial blocks.
- Saved browser-local drafts and up to 20 named setups.
- Original manuscript forms are educational prototypes, not validated handwriting curriculum content.

## Phase 3 implementation — `feature/visual-practice-tools`

**Prewriting shapes:** Switch between text and shapes; choose horizontal/vertical lines, wave, zigzag, circle, square, triangle, or spiral. Shapes are original 10-unit vector paths. Trace, Copy, Fade and Blank operate on the shape activity, with repeat spacing and reserved blank rows. **Current limitation:** The activity selector chooses one shape type or one text activity per sheet; mixed-shape and shape-plus-text sequences are not available yet.

**Selective highlighting:** Select source text in the Practice field, choose yellow/mint/peach highlight or remove it. Selected text is marked using source offsets; if a word wraps or the whole phrase repeats, corresponding letters retain the selection in every instance. Highlights are printable vector rectangles behind guidelines and letter strokes, not edits to the underlying words.

**Mixed practice support:** The global Trace/Copy/Fade/Blank setting remains the default. Assign a different practice mode to any selected word or text range. Multiple ranges with distinct combinations of highlight and support may coexist on the same writing row. Global Copy mode still displays only one model block; for repeated mixed-mode text, use global Trace and override selected words to Copy/Fade/Blank.

**Edits and storage:** Styling unaffected by edits is preserved/shifted; style ranges that intersect changed characters are discarded to avoid misapplying cues to the wrong text. Browser persistence validates/clamps ranges. Older saved worksheets default to text activity, no styling, and the circle shape preset.

**Activity library:** Editable grouped starter templates for names, sentence-copying/fading, letter-progression work, themed writing, and prewriting shapes. Selecting a template clears unrelated previous word styling and resets activity-level prompt/case/blank-row options to sensible template defaults without changing preferred paper dimensions.

**Shareable presets:** Export current or named worksheets as versioned JSON files, and import validated JSON into local settings/named presets. Includes highlights, mixed-mode selections, shapes and print options; imports are bounded, validated, and local to the browser.

## Phase 3 addition — word-spacing supports (implemented, hands-on QA pending)

**OT-first practice support:** In Practice Support, choose None, Colored dots, Highlighted spaces, Word boxes or Finger-spacing reminder. The cue selection has no effect on word-width measurements and is separate from character spacing.

**Adjustable cue intensity:**
- **Level 1:** Strong version of the selected visual cue (highlighted gap, prominent dot, word outline, or pronounced finger reminder).
- **Level 2:** Small colored gap dots, except a smaller reminder for Finger-spacing reminder style.
- **Level 3:** Small printable **FINGER SPACE** reminder positioned above the writing row.
- **Level 4:** No cues for independent practice.

**Automatic progression:** Optional switch grades intensity from the selected level toward Level 4 *between complete phrase repetitions*. Both lines of a wrapped sentence retain the same intensity. Blank practice rows can carry a minimal reminder before supports disappear. Few repetitions may skip an intermediate level.

**Rendering and interactions:** Cues use the same millimeter-based row and glyph geometry for SVG preview and vector PDF; word boxes use outlines, highlighted spaces are filled rectangles, dots are vector circles, and reminders are printable text. Spacing guidance works independently with worksheet-wide Trace, Copy, Fade and Blank and with word-specific formatting. Spacing cues do not apply to letter-by-letter or prewriting-shape activities.

**Persistence:** Current config, named saved setups, and versioned portable JSON presets retain cue type, current intensity and progression choice. Older saved files default to None / Level 1 / progression off.

**QA priorities:** Check visually that highlighted spaces do not obscure the writing line, boxes remain separated, dots appear between words rather than at wraps, reminders are readable without overlapping handwriting, and the PDF/printed page agrees with the preview on Letter and A4. Validate progression with 1-, 2- and 3-line sentences, reserved blank rows, and Trace/Fade/Blank.

## Next feature request — mixed-content worksheet builder (planned, not built)

The latest roadmap edit adds **two closely related goals**:

1. **Multiple shapes:** Place several *different* prewriting forms in one worksheet (for example, horizontal line, circle, triangle, square) rather than selecting a single shape repeated through the page.
2. **Mixed shapes and writing:** Combine selected prewriting shapes with **letters, numbers, words or sentences** and optional independent practice rows on one sheet.

**Proposed implementation direction:** Represent the worksheet as an ordered list of editable practice blocks, each with content type (shape/text), sequence or text, row allocation and mode (Trace/Copy/Fade/Blank). Use a simple add/reorder/remove interface; retain the existing global defaults, word highlighting and styling where text is involved. Render from one shared layout model in the live SVG, printable PDF, saved configurations and portable preset files. Define overflow and repetition rules before introducing mixed blocks to avoid the earlier sentence-repetition bug.

**Acceptance criteria:** A user can build a worksheet alternating e.g. **circle → triangle → letter A → number 3**, reserve blank rows, and obtain the same output in preview, PDF and print on US Letter/A4. Add migration and layout regression tests. This is a follow-up development milestone, **not yet ready for QA**.

## Hands-on QA checklist — before merge

1. Select **cat** from “The cat is small”; apply yellow highlight + Trace. Assign Copy to remaining words. Verify consistent mixed appearance across **all repeated rows**.
2. Repeat the same task with a longer sentence that wraps across 2–3 lines. Confirm the highlighted words stay correct through wrapping, extra character spacing, and repeated blocks.
3. Test overlapping selection actions: highlight, then Copy, then remove color only, then clear all styles. Use the Styled parts list to remove annotations. Confirm editing a marked word drops affected styles without shifting them to the wrong text.
4. Choose **Shapes**. Examine circle, zigzag, triangle, and spiral in Trace, Copy, Fade, and Blank; compare Letter/A4 and different line sizes. Try reserved blank rows.
5. Load each activity library category. Check that templates switch between text/shapes correctly and leave title, Name/Date, and baseline styling editable.
6. Export a styled/shape worksheet JSON file, then import it. Verify settings, marked ranges and shape types restore correctly. Test invalid/non-LineNook JSON and blocked browser storage.
7. Test all five **Word spacing cues** with intensity Levels 1–4, plus automatic progression; check wrapped-sentence block boundaries, selected-word Trace/Copy/Fade/Blank, and blank practice rows.
8. Compare live preview to downloaded vector PDFs and physical prints at **Actual size/100%**, including visible highlight color, dots, outlined words, finger reminders, selected stroke patterns and reserved blank rows.
9. Test browser/OS text selection interactions, keyboard navigation, smaller screens and narrow windows; verify settings and preview remain accessible.

Automated tests check geometry and serialization, **not clinical effectiveness** or printed-device accuracy.

## Remaining limitations

- Only one shape choice or one text exercise can occupy the current worksheet; mixed-content sequence builder is planned.
- Single-page worksheet/PDF; no automatic multipage print workflow.
- No rich-text WYSIWYG inside the textarea: select text there, apply a toolbar action, and inspect the annotated preview; highlights do not recolor the native textarea itself.
- Some unsupported Unicode characters become `?` in tracing, with a warning. Changing case for certain non-ASCII characters may not preserve one-to-one glyph positions.
- Original printable shape and handwriting paths have not been clinically validated against a standard curriculum. Review cueing, stroke sequence and motor complexity before use.
- Portable presets are files, not hosted links; no cloud storage or user-account sharing.
- Browser data may be cleared and there is no synchronization across devices.
- Physical printing is subject to printer margins, browser print scaling and color variations.

See [ROADMAP.md](ROADMAP.md) for Phase 4 and remaining research ideas.
