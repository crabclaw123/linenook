LineNook is a web application for generating customizable, printable handwriting worksheets for occupational therapists, teachers, and parents.

Future plans include touchscreen handwriting activities.

## Tech Stack
- React
- TypeScript
- Vite
- Vitest
- ESLint
- Material UI (planned)

## Current Development Phase
Phase 1 — Worksheet Studio & Layout Engine

## Current Git Branch
feature/worksheet-studio

## Completed
- Initialized React + TypeScript + Vite
- Configured ESLint
- Installed Vitest
- Created initial React components
- Implemented calculateRows()
- Created and passed calculateRows unit tests

## In Progress
- calculateRowPositions() implementation
- Row positioning unit tests

## Next Steps
1. Complete calculateRowPositions() tests
2. Implement handwriting guideline positioning
3. Connect worksheet engine to SVG rendering
4. Develop live worksheet preview
5. Implement PDF export

## Architecture Decisions
- Separate worksheet calculations from React components
- Keep the worksheet engine independent of the UI
- Use unit tests for core calculations
- Use SVG for worksheet rendering
- No traditional backend required for Version 1

## Known Issues
- calculateRows() needs validation for invalid inputs
- PDF generation has not been implemented

## Development Workflow
- Develop features on separate Git branches
- Run tests before merging
- QA completed features before merging into main
