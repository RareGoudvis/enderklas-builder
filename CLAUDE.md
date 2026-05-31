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

## Session tracking

At the end of every conversation where changes were made, prepend a new entry to
[UpdateState.md](UpdateState.md) using this format:

**YYYY-MM-DD** — [1-2 sentence summary of what changed and why]

Most recent entry goes at the top, below the `---` divider. Do this before the final response.

## Doc-sync rule

After any **structural** change, update **[ARCHITECTURE.md](ARCHITECTURE.md) + this
file** in the *same* change, before the final response. Treat these as triggers:

- a new exercise type / generator / viewer / config plugin, or a new row in
  `exerciseRegistry.ts` / `exerciseUI.tsx`;
- a new store **slice or action**, or a changed history / lock / autosave rule
  ([useWorksheetStore.tsx](src/store/useWorksheetStore.tsx));
- changed **persistence/share** format or version ([persistence.ts](src/services/persistence.ts));
- a new file or directory under `src/` (add it to the file maps);
- changed print/registry wiring.

ARCHITECTURE.md is the deep map (state table §3, registry table §7, file map §11,
teacher-workflow layer §13); CLAUDE.md is the short rules + directory tree. A
`Stop` hook ([.claude/hooks/doc-sync-check.ps1](.claude/hooks/doc-sync-check.ps1))
warns once if structural source files changed without these docs.

---

## What this is

Dutch primary-school **worksheet generator**. Teachers compose math exercise blocks, preview them on a virtual A4 sheet, and export via the browser print dialog (Save as PDF). UI is in Dutch.

> See [ARCHITECTURE.md](ARCHITECTURE.md) for the full system map (data flow, the
> add-a-type wiring contract, generator contract, per-type registry table). Keep
> both files in sync.
>
> See [UI-GUIDE.md](UI-GUIDE.md) for design tokens (theme.css CSS variables) and
> canonical component styles. **Use the tokens — never hardcode bg/text/border/accent
> hex** — and reuse the shared style helpers (incl. the place-value mask-button canon).

---

## Directory structure

```
src/
├── App.tsx                        # 3-panel layout, page-break logic, block routing
├── main.tsx                       # React entry point
├── index.css
├── assets/
│   ├── enderklas-logo.png
│   ├── theme.css
│   └── fonts/                     # .ttf files — used by HTML preview only (not PDF)
│       ├── Roboto-Regular.ttf
│       ├── Roboto-Bold.ttf
│       ├── RobotoMono-Regular.ttf
│       └── RobotoMono-Bold.ttf
├── config/
│   └── appstructure.ts            # APP_STRUCTURE tree: Domain → Subdomain → ExerciseType
├── store/
│   └── useWorksheetStore.tsx      # Single Zustand store, undo/redo, all state
├── hooks/
│   └── usePrint.ts                # Browser print trigger (window.print + dynamic @page)
├── styles/
│   └── appStyles.ts               # CSS-in-JS inline styles for layout
├── services/
│   ├── generateDispatch.ts        # typeId → generator → store-setter map (single source)
│   ├── persistence.ts             # Autosave / presets / share-link / file import-export
│   ├── math/
│   │   ├── types.ts               # All interfaces: MathBlock, Equation, Fraction, etc.
│   │   ├── mathEngine.ts          # Addition/subtraction/multiplication/division generator
│   │   ├── formatters.ts          # Number display helpers (decimals, thousands separator)
│   │   └── validators.ts          # (currently empty)
│   ├── clock/
│   │   ├── clockTypes.ts          # Time categories, Dutch time text formatting
│   │   └── clockGenerator.ts      # Clock exercise generator
│   ├── fractions/
│   │   └── fractionGenerator.ts   # Fraction exercise generator (shapes, coloring)
│   ├── splitsen/
│   │   └── splitsenGenerator.ts   # Decomposition (splitsen) exercise generator
│   ├── cijferen/
│   │   └── cijferGenerator.ts     # Column arithmetic generator
│   ├── geld/
│   │   └── geldGenerator.ts       # Money: herkennen/tekenen + wissel + teruggeven (3 exports)
│   ├── mab/
│   │   └── mabGenerator.ts        # MAB (Dienes place-value blocks) generator
│   ├── ordenen/                   # Ordering numbers (+ recomputeSplitsenExercise lives in splitsen)
│   │   └── ordenenGenerator.ts
│   ├── deelbaarheid/deelbaarheidGenerator.ts
│   ├── getallenas/getallenasGenerator.ts
│   └── temperatuur/temperatuurGenerator.ts   # kleuren / aflezen / verschil
├── config/
│   ├── appstructure.ts            # APP_STRUCTURE tree (above)
│   ├── exerciseRegistry.ts        # REGISTRY: typeId → generator/field/defaults (pure data)
│   ├── exerciseUI.tsx             # EXERCISE_UI: typeId → Viewer/Config (React)
│   ├── baseSettings.ts            # BaseSettings + baseApply (global snapshot-on-add)
│   ├── exerciseCatalog.ts         # flat addable catalog for mass-add / curriculum
│   └── version.ts                 # RELEASE_VERSION / RELEASE_SUMMARY for the "Nieuw" banner
└── components/
    ├── layout/
    │   ├── sidebar.tsx            # Left panel: tree nav + Geavanceerd group + locked palette
    │   ├── TopBar.tsx             # Toevoegen / Genereer alles / Delen dropdown / ⋯ Meer / print
    │   ├── BaseSettingsPanel.tsx  # Sidebar "Geavanceerd": Basisinstellingen + Curriculum buttons
    │   ├── BaseSettingsModal.tsx  # Global base-difficulty modal
    │   ├── AlphaPopup.tsx         # One-time alpha warning
    │   ├── HelpModal.tsx          # Ouders / Leerkrachten tabs
    │   └── PresetModal.tsx        # Save/load/delete named presets
    ├── massadd/MassAddModal.tsx   # "Toevoegen" mass-add modal
    ├── curriculum/CurriculumBuilderModal.tsx   # Curriculum builder (draftBlocks + real configs)
    ├── shared/ExercisePreview.tsx # Fit-to-card live example (mass-add + curriculum)
    ├── ui/
    │   └── IconButton.tsx         # Shared icon button (block controls)
    ├── configurator/
    │   ├── Inspector.tsx          # Right panel: routes to doc or block config; locked gating
    │   ├── sharedPluginStyles.ts  # Shared button/pill/on-off styles for config plugins
    │   └── plugins/               # One *Config.tsx per exercise family
    │       ├── AdditionConfig.tsx
    │       ├── SubtractionConfig.tsx
    │       ├── MultiplicationConfig.tsx
    │       ├── DivisionConfig.tsx
    │       ├── FractionConfig.tsx
    │       ├── ClockConfig.tsx
    │       ├── CijferConfig.tsx
    │       ├── SplitsenConfig.tsx
    │       ├── GeldConfig.tsx
    │       ├── GeldWisselConfig.tsx
    │       ├── GeldTeruggevenConfig.tsx
    │       ├── MabConfig.tsx
    │       ├── OrdenenConfig.tsx
    │       ├── DeelbaarheidConfig.tsx
    │       ├── GetallenasConfig.tsx
    │       ├── TemperatuurConfig.tsx
    │       ├── addition/          # Sub-configs per number type
    │       │   ├── NaturalSettings.tsx
    │       │   ├── DecimalSettings.tsx
    │       │   └── RationalSettings.tsx
    │       └── multiplication/
    │           ├── NaturalSettings.tsx
    │           ├── DecimalSettings.tsx
    │           └── RationalSettings.tsx
    └── viewer/                    # HTML preview renderers (one per exercise family)
        ├── MathBlockRenderer.tsx  # Standard equations (inline / stepped layout)
        ├── ClockExerciseItem.tsx  # Single clock exercise display
        ├── AnalogClockSVG.tsx     # SVG clock face (preview only)
        ├── FractionExerciseItem.tsx
        ├── FractionShapeSVG.tsx   # SVG fraction shapes (circle, rectangle)
        ├── SplitsenViewer.tsx     # Decomposition pair boxes
        ├── CijferViewer.tsx       # Column arithmetic grid
        ├── GeldViewer.tsx         # Money recognition coins/bills
        ├── GeldTekenenViewer.tsx  # Money drawing exercises
        ├── GeldWisselViewer.tsx   # Money exchange exercises
        ├── GeldTeruggevenViewer.tsx # Money change-making exercises
        ├── ClockViewer.tsx        # Clock grid wrapper (maps to ClockExerciseItem)
        ├── FractionViewer.tsx     # Fraction grid wrapper (maps to FractionExerciseItem)
        ├── MabViewer.tsx          # MAB blocks (mode derived from typeId)
        ├── MabBlocksSVG.tsx       # SVG Dienes blocks (symbolic / bw / color)
        ├── OrdenenViewer.tsx      # Ordering (click a number to edit)
        ├── DeelbaarheidViewer.tsx
        ├── GetallenasViewer.tsx   # Number line (decimal/rational/geheel ticks)
        ├── TemperatuurViewer.tsx  # Thermometer(s): kleuren / aflezen / verschil
        ├── VerticalFraction.tsx   # Shared stacked-fraction component
        └── FragmentableGrid.tsx   # row-chunked grid so items flow across print page breaks
```

---

## Architecture

Three-panel layout in [App.tsx](src/App.tsx):

```
┌──────────────┬───────────────────────────┬──────────────────┐
│   Sidebar    │      A4 Preview           │    Inspector     │
│              │                           │                  │
│ APP_STRUCTURE│  header                   │  (doc settings   │
│ tree nav     │  [block 1]                │   when no block  │
│              │  [block 2]                │   selected)      │
│ clicking     │  …                        │                  │
│ leaf calls   │  footer                   │  (block config   │
│ addBlock     │                           │   + Genereer btn │
│ FromType()   │  page-break indicators    │   when block     │
│              │  every 1044px             │   is active)     │
└──────────────┴───────────────────────────┴──────────────────┘
```

**Data flow:**
```
User clicks exercise in Sidebar
  → addBlockFromType(typeId, label)   [store]
  → new MathBlock with default constraints added to blocks[]
  → Inspector shows block config
User adjusts settings in Inspector
  → updateBlockSettings(id, { constraints: {...} })   [store]
User clicks "Genereer"
  → regenerateBlock(block, setExercises)   [generateDispatch.ts]
  → REGISTRY[typeId].generate(block) → exercise array
  → setExercises(id, REGISTRY[typeId].exerciseField, array)   [store, generic]
  → EXERCISE_UI[typeId].Viewer re-renders with new data
```

Both the per-block "Genereer" (Inspector) and "Genereer alles" (TopBar) route
through `regenerateBlock` in [generateDispatch.ts](src/services/generateDispatch.ts),
which looks the type up in the registry ([exerciseRegistry.ts](src/config/exerciseRegistry.ts)).

---

## State — [useWorksheetStore.tsx](src/store/useWorksheetStore.tsx)

Single Zustand store. Everything is in memory (no persistence). Key slices:

| Slice | Type | Purpose |
|---|---|---|
| `blocks` | `MathBlock[]` | Ordered list of exercise blocks on the sheet |
| `activeBlockId` | `string \| 'document' \| null` | Drives Inspector panel context |
| `header` | `HeaderData` | Naam/klas/nummer/datum toggles + title |
| `footer` | `FooterData` | School/klas/leerkracht/pagina toggles + values |
| `docSettings` | `DocSettings` | titlePosition, headerStyle, opdrachtTitelStyle, showScores, showDividers |
| `showSolutions` | `boolean` | Toggles red solution overlay in preview and print |
| `theme` | `'dark' \| 'light' \| 'colorblind'` | Persisted to localStorage, applied as `data-theme` on `<html>` |
| `baseSettings` | `BaseSettings` | Global default difficulty snapshotted into each new block (`baseApply`) — see ARCHITECTURE §13 |
| `curriculum` | `CurriculumLock \| null` | Non-null + `locked` = restricted parent mode (whitelist sidebar, frozen difficulty) |
| `draftBlocks` | `MathBlock[]` | Off-sheet scratch blocks the curriculum builder edits via the real config plugins |
| `_history` / `_historyIndex` | `MathBlock[][]` / `number` | Undo/redo stack, max 50 snapshots |

Every mutation that changes `blocks` calls `pushHistory` to snapshot the new state. `updateHeader`, `updateFooter`, `updateDocSettings`, `setShowSolutions`, `setTheme`, `toggleBlockLock`, `updateBaseSettings`, `setDraftBlocks` do **not** push history. Generated exercises are written by one generic action `setExercises(id, field, data)` (field = the registry's `exerciseField`); `patchExercise(id, field, exerciseId, patch)` edits a single element (ordenen click-to-edit, splitsen manual numbers). When `curriculum?.locked`, `updateBlockSettings`/`updateBlockLayout`/`updateBlockInstruction` freeze everything but count + page-break.

A store subscription auto-saves the worksheet to localStorage (1.5 s debounce; payload includes `baseSettings` + `curriculum`) — see [persistence.ts](src/services/persistence.ts). **Share/file format is v2** (lz-string compressed `#share=` hash; optional `baseSettings` + `curriculum` for locked curriculum links).

**Teacher-workflow layer** (base settings · mass-add · curriculum builder + locked mode) is documented in **[ARCHITECTURE.md](ARCHITECTURE.md) §13** — none of it adds `typeId` branches; it drives the registry/config machinery.

`MathBlock.constraints` is typed as `any` — a loose bag of options read differently by each generator. Default constraints per block type are set in `addBlockFromType`.

---

## Exercise types

All types defined in `APP_STRUCTURE` ([appstructure.ts](src/config/appstructure.ts)):
`Domain → Subdomain → ExerciseType`.

| `typeId` pattern | Exercise array | Generator | Viewer |
|---|---|---|---|
| `optellen-*`, `aftrekken-*` | `exercises: Equation[]` | `mathEngine.ts` | `MathBlockRenderer` |
| `vermenigvuldigen-*`, `delen-*` | `exercises: Equation[]` | `mathEngine.ts` | `MathBlockRenderer` |
| `klok-*` | `clockExercises: ClockExercise[]` | `clockGenerator.ts` | `ClockExerciseItem` |
| `breuken` | `fractionExercises: FractionExercise[]` | `fractionGenerator.ts` | `FractionExerciseItem` |
| `splitsen` | `splitsenExercises: SplitsenExercise[]` | `splitsenGenerator.ts` | `SplitsenViewer` |
| `cijferen` | `cijferExercises: CijferExercise[]` | `cijferGenerator.ts` | `CijferViewer` |
| `geld-herkennen` | `geldExercises: GeldExercise[]` | `geldGenerator.ts` | `GeldViewer` |
| `geld-tekenen` | `geldExercises: GeldExercise[]` | `geldGenerator.ts` | `GeldTekenenViewer` |
| `geld-wissel` | `geldWisselExercises: GeldWisselExercise[]` | `geldGenerator.ts` | `GeldWisselViewer` |
| `geld-teruggeven` | `geldTeruggevenExercises: GeldTeruggevenExercise[]` | `geldGenerator.ts` | `GeldTeruggevenViewer` |
| `mab-herkennen`, `mab-tekenen` | `mabExercises: MabExercise[]` | `mabGenerator.ts` | `MabViewer` |
| `ordenen` | `ordenenExercises: OrdenenExercise[]` | `ordenenGenerator.ts` | `OrdenenViewer` |
| `deelbaarheid` | `deelbaarheidExercises: DeelbaarheidExercise[]` | `deelbaarheidGenerator.ts` | `DeelbaarheidViewer` |
| `getallenas` | `getallenasExercises: GetallenasExercise[]` | `getallenasGenerator.ts` | `GetallenasViewer` |
| `temperatuur` | `temperatuurExercises: TemperatuurExercise[]` | `temperatuurGenerator.ts` | `TemperatuurViewer` |

Placeholder leaves in `appstructure.ts` (`placeholder: true` / `typeId: '__placeholder__'`) are **not implemented** — they show as greyed tree entries only. See the full per-typeId registry table in [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Exercise generation pipeline

Each generator:
1. Reads `block.constraints` for parameters (ranges, number types, etc.)
2. Generates candidates in a retry loop (max `MAX_ATTEMPTS = 20000`)
3. Tracks used combinations in a `Set<string>` to avoid duplicates
4. Returns a typed exercise array

The "Genereer" button in Inspector dispatches to the right generator based on `block.typeId`, then calls the appropriate `set*Exercises` action on the store.

---

## Adding a new exercise type

Types are declared in a **central registry** keyed by exact `typeId`:
[exerciseRegistry.ts](src/config/exerciseRegistry.ts) (pure data — generator,
field, defaults) + [exerciseUI.tsx](src/config/exerciseUI.tsx) (Viewer + Config).
Dispatch / Inspector / App / `addBlockFromType` are registry lookups, **not**
if-else branches. Don't add `typeId ===` branches. See [ARCHITECTURE.md](ARCHITECTURE.md) §5.

1. Add the exercise interface + its array field to `MathBlock` in [src/services/math/types.ts](src/services/math/types.ts) (optionally a `[Type]Constraints` interface)
2. Create generator at `src/services/[type]/[type]Generator.ts` (returns `[Type]Exercise[]`)
3. Create viewer at `src/components/viewer/[Type]Viewer.tsx` taking uniform `{ block, showSolutions }`
4. Create config plugin at `src/components/configurator/plugins/[Type]Config.tsx` taking `{ block }`
5. Add **one row** to `REGISTRY` in `exerciseRegistry.ts` and **one row** to `EXERCISE_UI` in `exerciseUI.tsx` (same `typeId` key)
6. Add to `APP_STRUCTURE` in `appstructure.ts` with `typeId` + optional `defaultConstraints` (merged on top of registry defaults)

---

## Math engine ([mathEngine.ts](src/services/math/mathEngine.ts))

Uses `INTERNAL_SCALE = 1_000_000` to avoid JS float rounding — all arithmetic is done as scaled integers, then divided back.

`MathBlock.constraints.bridges` is a map of place-value keys → constraint:
- `E` = Eenheden (units), `T` = Tientallen (tens), `H` = Honderdtallen (hundreds), etc.
- Values: `'FREE'` | `'REQUIRED'` | `'FORBIDDEN'`
- `REQUIRED` means the addition/subtraction at that position must carry/borrow (bruggetje)

`operand1Mask` / `operand2Mask` control digit structure:
- `{ M: true, T: false, E: true }` generates numbers with millions and units digits only

---

## Config plugins

Each `*Config` component in [src/components/configurator/plugins/](src/components/configurator/plugins/) renders settings for one operation type. They call `updateBlockSettings(id, { constraints: { ...c, key: value } })` directly. The `Inspector` mounts whichever plugin matches `activeBlock.typeId`.

---

## Print / PDF export

**There is no react-pdf / `WorksheetPDF.tsx`** (it was removed). Export is the
browser print dialog → Save as PDF — the on-screen preview *is* what prints.

- [usePrint.ts](src/hooks/usePrint.ts) — `handlePrint(withSolutions)` deselects the
  active block, optionally flips `showSolutions`, injects a dynamic style that blanks
  the browser's header/footer margin boxes, then calls `window.print()`.
- **The A4 card is a real `<table>`** (`.print-area`), wrapped in `.print-area-shell`
  (the screen card + `a4Ref`). Chrome only repeats `<thead>`/`<tfoot>` across pages
  for *real* table markup, so `thead.print-thead` carries the top margin (+ optional
  repeating Naam/Klas strip via `header.repeatHeader`) and `tfoot.print-tfoot` carries
  the footer (school/klas/leerkracht left, vrije tekst right) — both repeat every page
  and reserve height, so nothing overlaps. **No page number** (Chrome can't count pages
  from HTML/CSS). On screen the table is flattened to block flow.
- **`@page { margin: 0 }`** on purpose: the dialog's "Margins: None" overrides `@page`
  margins, so all margins come from the table groups (thead height, `.print-body-cell`
  16mm side padding, tfoot height) instead — dialog-proof.
- **[FragmentableGrid](src/components/viewer/FragmentableGrid.tsx)** — multi-item
  viewers route items through it (block stack of per-row grids, each row
  `.print-row` = `break-inside:avoid`). A single CSS grid does NOT fragment across
  pages in Chrome; this lets exercises flow across page breaks. `.print-exercise`
  (and `.print-row`) never split mid-item; `.print-block.page-break-before` forces a
  fresh page; `.print-opdracht` never orphans the instruction line.
- Page-break indicators (screen only) draw every `PAGE_H = 1044px` (A4 @ 96dpi) in
  [App.tsx](src/App.tsx).

**SYNC rule:** there's no separate PDF file to mirror, but any viewer change must
still print correctly — verify the print CSS classes above still apply, and that
multi-item viewers go through `FragmentableGrid`.

See [ARCHITECTURE.md](ARCHITECTURE.md) §9–10 for print + persistence/sharing detail.

---

## Key type definitions

[src/services/math/types.ts](src/services/math/types.ts)

```ts
// Standard equation (optellen / aftrekken / vermenigvuldigen / delen)
interface Equation {
  id: string;
  operands: (number | Fraction)[];
  operator: '+' | '-' | 'x' | ':';
  answer: number | Fraction;
  steps?: number[];
  remainder?: number;
  missingTerm?: 'result' | 'operand1' | 'operand2';
  isManuallyEdited: boolean;
}

// Fraction value — whole is only set for mixed numbers (e.g. 1½ → { whole:1, n:1, d:2 })
interface Fraction { whole?: number; n: number; d: number; }

// Clock exercise
interface ClockExercise {
  id: string;
  hours: number; minutes: number;
  timeText: string;    // Dutch: "kwart over 3"
  digitalText: string; // "03:15"
  isManuallyEdited: boolean;
}

// Fraction visual exercise
interface FractionExercise {
  id: string;
  subType: 'kleuren' | 'herkennen' | 'hoeveelheid' | 'hoeveelheid-rechthoek' | 'hoeveelheid-abstract' | 'lijnstuk' | 'veelhoek';
  numerator: number; denominator: number;
  shape?: 'rectangle' | 'circle';
  coloredIndices?: number[];
  gridRows?: number; gridCols?: number;
  total?: number;
  objectShape?: 'circle' | 'square';
  lineLength?: number;
  rectangleWidth?: number; rectangleHeight?: number;
  isManuallyEdited: boolean;
}

// Decomposition (splitsen)
interface SplitsenExercise {
  id: string;
  total: number;
  pairs: Array<{ given: number; answer: number }>;
  isManuallyEdited: boolean;
}

// Column arithmetic (cijferen)
interface CijferExercise {
  id: string;
  operands: number[];
  operator: CijferOperator;
  answer: number; remainder: number;
  isManuallyEdited: boolean;
}

// Money exercise
interface GeldExercise {
  id: string;
  amountCents: number;
  denominations: GeldDenomination[];
  isManuallyEdited: boolean;
}

// Parent container — one block = one exercise section on the sheet
interface MathBlock {
  id: string;
  typeId: string;              // matches APP_STRUCTURE leaf typeId
  instructionText: string;
  instructionMode: 'geen' | 'mag' | 'moet' | 'plus' | 'aangepast';
  customInstructionText?: string;
  layoutPreset: 'inline-short' | 'inline-long' | 'stepped';
  steppedLines: number;
  numberOfExercises: number;
  totalPoints: number;
  verticalSpacing: number;
  constraints: any;            // loose bag — see each generator for expected keys
  locked?: boolean;            // locked blocks are skipped by "Genereer alles"
  exercises: Equation[];
  clockExercises?: ClockExercise[];
  fractionExercises?: FractionExercise[];
  splitsenExercises?: SplitsenExercise[];
  cijferExercises?: CijferExercise[];
  geldExercises?: GeldExercise[];
  geldWisselExercises?: GeldWisselExercise[];
  geldTeruggevenExercises?: GeldTeruggevenExercise[];
  mabExercises?: MabExercise[];
}
```

> The full set of exercise interfaces (incl. `GeldWisselExercise`,
> `GeldTeruggevenExercise`, `MabExercise`, `CijferConstraints`) lives in
> [types.ts](src/services/math/types.ts); see [ARCHITECTURE.md](ARCHITECTURE.md) §4.

---

## Code commenting guidelines

Comment the **WHY**, not the WHAT. Well-named identifiers already describe what the code does. These rules apply everywhere in this codebase:

1. **Non-obvious logic** — if a junior dev might ask "why does this work?", add a one-line comment above it.
   - Bad: `const scaled = val * 1_000_000;`
   - Good: `// Avoid JS float rounding — all math uses scaled integers, divide back at display time`

2. **Business rules** — Dutch education domain logic must be explained in English.
   - Example: `// 'bruggetje' = carry/borrow across a place-value boundary (Dutch primary school term)`
   - Example: `// 'splitsen' = decomposing a number into two parts, e.g. 7 → 3+4`

3. **Constraint meanings** — document what constraint values mean, since `constraints` is typed as `any`.
   - Example: `// bridges.E = 'REQUIRED' means the units column must produce a carry/borrow`

4. **Magic numbers** — always explain the origin.
   - Example: `// 1044px = A4 height at 96dpi screen resolution`
   - Example: `// MAX_ATTEMPTS = 20000 prevents infinite loop when constraints are over-restrictive`

5. **Parallel logic** — mark code that must stay in sync with its twin elsewhere.
   - Example: `// SYNC: keep MabViewer.tsx and MabBlocksSVG.tsx block sizing aligned`
   - Applies to any logic duplicated across files (e.g. a viewer and its SVG helper).

6. **No comment needed for:** standard React hooks usage, obvious state setters, self-explanatory JSX structure, imported library calls where the function name is clear.

Functions get at most one short sentence — only when the function name + parameter names don't tell the full story. No multi-line docblocks.
