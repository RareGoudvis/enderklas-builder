# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (Vite)
npm run build     # tsc -b && vite build
npm run lint      # eslint
npm run preview   # preview production build
```

No test suite configured.

## What this is

Dutch primary-school **worksheet generator**. Teachers compose math exercise blocks, preview them on a virtual A4 sheet, and export to PDF. UI is in Dutch.

## Architecture

Three-panel layout in [App.tsx](src/App.tsx):
- **Left** – [Sidebar](src/components/layout/sidebar.tsx): tree of exercise types from `APP_STRUCTURE` ([appstructure.ts](src/config/appstructure.ts)). Clicking a leaf calls `addBlockFromType`.
- **Center** – A4 preview. Renders `blocks` from the Zustand store. Each block dispatches to a type-specific renderer (math rows, clock grid, fraction grid).
- **Right** – [Inspector](src/components/configurator/Inspector.tsx): context-aware panel. When `activeBlockId === null` or `'document'` → document/header/footer settings. When a block is active → block settings + type-specific `*Config` plugin + "Genereer" button.

## State — [useWorksheetStore.tsx](src/store/useWorksheetStore.tsx)

Single Zustand store. Everything is in memory (no persistence). Key slices:

| Slice | Type | Purpose |
|---|---|---|
| `blocks` | `MathBlock[]` | Ordered list of exercise blocks on the sheet |
| `activeBlockId` | `string \| 'document' \| null` | Drives Inspector panel context |
| `header` | `HeaderData` | Naam/klas/nummer/datum toggles + title |
| `footer` | `FooterData` | School/klas/leerkracht/pagina toggles + values |
| `docSettings` | `DocSettings` | titlePosition, headerStyle, opdrachtTitelStyle, showScores, showDividers |
| `showSolutions` | `boolean` | Toggles red solution overlay in preview and PDF |
| `_history` / `_historyIndex` | `MathBlock[][]` / `number` | Undo/redo stack, max 50 snapshots |

Every mutation that changes `blocks` calls `pushHistory` to snapshot the new state. `updateHeader`, `updateFooter`, `updateDocSettings`, `setShowSolutions` do **not** push history.

`MathBlock.constraints` is typed as `any` — a loose bag of options read differently by each generator. Default constraints per block type are set in `addBlockFromType`.

## Exercise types

Defined in `APP_STRUCTURE` (Domain → Subdomain → ExerciseType). Three block families:

| `typeId` pattern | Exercise array | Generator |
|---|---|---|
| `klok-*` | `clockExercises: ClockExercise[]` | `clockGenerator.ts` |
| `breuken` | `fractionExercises: FractionExercise[]` | `fractionGenerator.ts` |
| anything else (optellen/aftrekken/…) | `exercises: Equation[]` | `mathEngine.ts` |

## Math engine ([mathEngine.ts](src/services/math/mathEngine.ts))

Uses `INTERNAL_SCALE = 1_000_000` to avoid JS float rounding — all arithmetic is done as scaled integers, then divided back. `MAX_ATTEMPTS = 20000` retry loop rejects candidates that violate bridge (carry/borrow) constraints or duplicate combinations.

`MathBlock.constraints.bridges` is a map of place-value keys (E, T, H, …) → `'FREE' | 'REQUIRED' | 'FORBIDDEN'`.

## Config plugins

Each `*Config` component in [src/components/configurator/plugins/](src/components/configurator/plugins/) renders settings for one operation type. They call `updateBlockSettings(id, { constraints: { ...c, key: value } })` directly. The `Inspector` mounts whichever plugin matches `activeBlock.typeId`.

## PDF export — [WorksheetPDF.tsx](src/components/pdf/WorksheetPDF.tsx)

Uses `@react-pdf/renderer`. Receives the same props as the preview (`blocks`, `headerData`, `footerData`, `showSolutions`, `docSettings`) and mirrors all rendering logic using `react-pdf` primitives (`View`, `Text`, `Svg`, `Line`, `Rect`, `Path`, `Circle`) instead of HTML/CSS.

**Critical rules when editing rendering logic:**
- Any visual change to the preview (`App.tsx`) must be mirrored in `WorksheetPDF.tsx`, and vice versa. They are parallel — not shared.
- Fonts are loaded via `Font.register` at module load from `@fontsource` WOFF files (imported with `?url`). Do not use `.ttf` paths here.
- The analog clock SVG is hand-drawn in both files independently (`AnalogClockSVG.tsx` for preview, `renderAnalogClockPDF` inside `WorksheetPDF.tsx` for PDF).
- 1-column layouts (`inline-long`, `stepped`) use `wrap={false}` on each exercise `View` to prevent page-break mid-exercise.
- Footer uses `fixed` prop so it appears on every PDF page.
- Solution color is `#e11d48` (red) throughout — `S.sol` style in the PDF stylesheet.
- The PDF stylesheet (`S`) is a `StyleSheet.create({})` object at the bottom of the file — `react-pdf` does not accept arbitrary CSS, only its own subset.

Fonts (Roboto, Roboto Mono) are also available as `.ttf` assets in [src/assets/fonts/](src/assets/fonts/) (used only by the HTML preview via CSS `@font-face`, not by the PDF).

## Key type definitions

[src/services/math/types.ts](src/services/math/types.ts) — `MathBlock`, `Equation`, `Fraction`, `ClockExercise`, `FractionExercise`, `FractionSubType`.

`Fraction = { whole?: number; n: number; d: number }` — mixed numbers carry a `whole` field.
