# LineNook — Project Status

**Updated:** October 21, 2026  
**Product:** Browser-based studio for creating printable handwriting practice worksheets for occupational therapists, educators, and families.

## Current snapshot

**Phase 1:** Merged into `main`. The roadmap marks its initial hands-on print QA complete.  
**Phase 2:** Implemented on `feature/phase-2-worksheet-enhancements`; the user has visually reviewed the updated interface and Fade experience positively. **Final Phase 2 hands-on QA and release review remain open.**  
**Phase 3:** Not started; existing plan is the worksheet activity library.

Latest verified Phase 2 CI: [GitHub Actions — passing run](https://github.com/crabclaw123/linenook/actions/runs/39360921115) on commit `20452db` — **62/62 unit tests passing**, ESLint passing, and production build passing. Tests establish technical behavior, not clinical effectiveness or physical print fidelity.

## Technology and architecture

- **Frontend:** React, TypeScript, Vite, CSS, SVG.
- **Testing:** Vitest, ESLint, TypeScript build; GitHub Actions checks feature-branch pushes and PRs to `main`.
- **Layout:** Shared millimeter-based page geometry, writing-row positions, tracing placements, and guideline styles across SVG preview and exported PDF.
- **Export:** One-page, dependency-free vector PDF plus browser print view.
- **Persistence:** Browser `localStorage`; no accounts, database, backend, or cloud synchronization.

## Delivered functionality

### Phase 1 — Printable worksheet studio

- Responsive two-panel editor, immediate US Letter live preview, and editable worksheet title/practice text.
- Writing-size presets (Compact / Everyday / Extra room) and linked writing-height + row-gap controls that reserve space for descenders.
- Page-margin controls and optional distribution of unused vertical space between rows without distorting writing height.
- Original monoline uppercase/lowercase letters, digits, and punctuation rendered as dotted tracing; blank-line alternative.
- Basic content templates, text wrapping, overflow and unsupported-symbol warnings.
- Matching PDF download and printable worksheet view.

### Phase 2 — Clinical and educational customization (implemented; QA ongoing)

- **Guidelines:** Classic top/middle/baseline, colored top/middle/baseline cues, double-line, and baseline-only styles; optional warm baseline emphasis.
- **Graded practice:** Trace, Copy (solid reference with blank writing rows), Fade (progressively lighter prompts), and Blank.
- **Fade refinement:** Repeated short prompts fade toward independent blank rows; longer content now lightens across the *rows that actually contain text*, making the difference from Trace visible.
- **Text options:** Whole-phrase or one-letter-per-row prompts; uppercase/lowercase/as-typed choices; original simple manuscript and alternate rounded forms for selected characters.
- **Letterform refinement:** Improved several prototype glyphs, including a revised two-stroke lowercase **y** descender flagged during screenshot QA.
- **Handedness:** Left-handed Copy mode positions the exemplar to the right to reduce potential hand obstruction.
- **Paper:** US Letter and A4 geometry for live preview, PDF export, and print.
- **Header:** Optional **Name** and **Date** fields with dedicated vertical space above the first writing row.
- **Spacing:** User-adjustable **extra character spacing from 0–8 mm**; added physical spacing is consistent in text measurement, wrapping, SVG preview, PDF, and saved setups.
- **Reusable settings:** Automatic local draft restoration and up to 20 named, browser-local presets, including save/load/delete.

## QA bug cleanup — branch `qa/bug-cleanup-1`

- **Repeating long sentences:** Whole-phrase Trace and Fade now repeat the entire wrapped text block on subsequent writing rows, not only single-row phrases. A partial second copy is never printed; leftover rows stay blank.
- **Independent blank-line choice:** Added an integer `blankPracticeRows` setting that reserves space below models for independent practice. It appears under Practice Support, persists with current settings/named setups, and is bounded by the available row count.
- **Copy compatibility:** In Copy mode, a multi-line model is displayed once and then followed by blank writing rows.
- **Fade compatibility:** Opacity decreases by **complete phrase repetition** so both rows of a wrapped sentence stay equally readable within a given repetition.
- **Always-visible desktop preview:** A desktop split workspace uses an independently scrollable settings pane and sticky, viewport-fitted worksheet preview. Mobile/tablet keep the ordinary stacked layout.
- **QA to perform:** On desktop, scroll to the bottom of the settings panel while viewing the live sheet and verify print remains the full-size original; test 1-line, 2-line, and 3-line phrases, reserved blank-row counts, Fade and Copy, plus A4 and saved presets.

## QA evidence and outstanding release checks

**Completed / observed**
- Automated suite: **62 tests in 12 files**, all passing at the last verified run; lint and build passed.
- User screenshots showed correct rendering of an alphabet sample, guideline styling, and Fade progression for `HELLO`; user approved the latest visual direction.
- Specific screenshot-reported defects were addressed: awkward lowercase **y**, Fade being barely distinguishable with long content, and a need for wider character spacing.
- The [roadmap](ROADMAP.md) currently marks Phase 1 print QA and an internal clinician letterform review/sign-off item checked. **No standardized-curriculum certification or independently documented clinical validation is implied by those checkboxes.**

**Still to verify before merging Phase 2 into `main`**
1. Inspect newly revised lowercase **y**, plus **g, j, p, q** and every alternate manuscript letterform, at the actual printed writing size.
2. Exercise 0, 3, 6, and 8 mm character spacing with short and long phrases; check legibility, wrap behavior, and that no text clips.
3. Compare Trace vs Fade using `Hello`, `HELLO`, and longer alphabet/sentence content; determine whether grading of long, nonrepeating text meets the intended OT use case.
4. Check Copy for right-/left-handed settings, whole-phrase and letter-by-letter modes, and preservation of usable blank writing space.
5. Compare **PDF to browser preview** for all guideline styles, colored baselines, Name/Date headers, and Letter/A4 sizes; physically print at **100% / Actual size** with matching paper and browser headers/footers disabled.
6. Verify saved setups (create, replace, load, delete, reload), mobile layout, overflow warnings, and blocked/unavailable browser storage.

## Product decisions and open questions

- The Phase 2 interface and its controls are sufficiently established to prioritize **clinical usability, physical print quality, and handwriting mechanics** over adding more UI features.
- The current Fade implementation removes visual information rather than reducing letter size or guideline height. An optional future intensity control (**gentle / moderate / strong**) could improve grading.
- **Long-text Fade needs instructional review:** fading different portions of a sentence is not the same as practicing and gradually fading *the same* motor sequence. Repeated-target fading could become a later enhancement.
- Review whether 8 mm maximum extra character spacing is useful or whether a tighter range better serves typical intervention activities.

## Known limitations

- Only **one-page PDF export**; no multipage output.
- LineNook glyphs are **original prototype teaching shapes**, not a standardized, licensed, or independently validated handwriting curriculum. Clinical review of formation conventions should continue.
- Some Unicode characters/diacritics are not supported in tracing and become `?` with a visible warning; PDF titles use built-in Helvetica with basic transliteration.
- Browser-only saved data may disappear if local site storage is cleared and does not sync between devices.
- Letter-by-letter mode uses one row per target letter; extra targets generate an overflow warning.
- Physical results vary with printer margins, scaling, and color settings.

## Next milestone

Finish the Phase 2 QA checklist, document any fixes, and open a PR from `feature/phase-2-worksheet-enhancements` to `main` after review. **Do not treat Phase 2 as merged or production/clinically validated yet.**

Phase 3 scope remains as defined in [ROADMAP.md](ROADMAP.md): name-writing and sentence-copying activities, letter-formation progressions, themed activities, shareable/exportable presets, and reusable activity templates.
