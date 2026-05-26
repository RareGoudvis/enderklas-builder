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

---

## What this is

Dutch primary-school **worksheet generator**. Teachers compose math exercise blocks, preview them on a virtual A4 sheet, and export to PDF. UI is in Dutch.

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
│   └── usePrint.ts                # Browser print / PDF export trigger
├── styles/
│   └── appStyles.ts               # CSS-in-JS inline styles for layout
├── services/
│   ├── math/
│   │   ├── types.ts               # All interfaces: MathBlock, Equation, Fraction, etc.
│   │   ├── mathEngine.ts          # Addition/subtraction/multiplication/division generator
│   │   ├── formatters.ts          # Number display helpers (decimals, thousands separator)
│   │   └── validators.ts          # Input validation helpers
│   ├── clock/
│   │   ├── clockTypes.ts          # Time categories, Dutch time text formatting
│   │   └── clockGenerator.ts      # Clock exercise generator
│   ├── fractions/
│   │   └── fractionGenerator.ts   # Fraction exercise generator (shapes, coloring)
│   ├── splitsen/
│   │   └── splitsenGenerator.ts   # Decomposition (splitsen) exercise generator
│   ├── cijferen/
│   │   └── cijferGenerator.ts     # Column arithmetic generator
│   └── geld/
│       └── geldGenerator.ts       # Money exercise generator
└── components/
    ├── layout/
    │   ├── sidebar.tsx            # Left panel: APP_STRUCTURE tree nav
    │   └── TopBar.tsx             # Print/export buttons
    ├── configurator/
    │   ├── Inspector.tsx          # Right panel: routes to doc or block config
    │   ├── sharedPluginStyles.ts  # Shared button/input styles for config plugins
    │   └── plugins/               # One *Config.tsx per exercise type
    │       ├── AdditionConfig.tsx
    │       ├── SubtractionConfig.tsx
    │       ├── MultiplicationConfig.tsx
    │       ├── DivisionConfig.tsx
    │       ├── FractionConfig.tsx
    │       ├── ClockConfig.tsx
    │       ├── CijferConfig.tsx
    │       ├── SplitsenConfig.tsx
    │       ├── GeldConfig.tsx
    │       ├── addition/          # Sub-configs per number type
    │       │   ├── NaturalSettings.tsx
    │       │   ├── DecimalSettings.tsx
    │       │   └── RationalSettings.tsx
    │       └── multiplication/
    │           ├── NaturalSettings.tsx
    │           ├── DecimalSettings.tsx
    │           └── RationalSettings.tsx
    └── viewer/                    # HTML preview renderers (one per exercise type)
        ├── MathBlockRenderer.tsx  # Standard equations (inline / stepped layout)
        ├── ClockExerciseItem.tsx  # Single clock exercise display
        ├── AnalogClockSVG.tsx     # SVG clock face (preview only)
        ├── FractionExerciseItem.tsx
        ├── FractionShapeSVG.tsx   # SVG fraction shapes (circle, rectangle)
        ├── SplitsenViewer.tsx     # Decomposition pair boxes
        ├── CijferViewer.tsx       # Column arithmetic grid
        ├── GeldViewer.tsx         # Money recognition coins/bills
        └── GeldTekenenViewer.tsx  # Money drawing exercises
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
  → Inspector dispatches to correct generator service
  → generator reads block.constraints, returns typed exercise array
  → set*Exercises(id, exercises[])   [store]
  → viewer component re-renders with new data
```

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
| `showSolutions` | `boolean` | Toggles red solution overlay in preview and PDF |
| `_history` / `_historyIndex` | `MathBlock[][]` / `number` | Undo/redo stack, max 50 snapshots |

Every mutation that changes `blocks` calls `pushHistory` to snapshot the new state. `updateHeader`, `updateFooter`, `updateDocSettings`, `setShowSolutions` do **not** push history.

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

1. Add types to [src/services/math/types.ts](src/services/math/types.ts)
2. Create generator at `src/services/[type]/[type]Generator.ts`
3. Add the exercise array field to `MathBlock` in `types.ts`
4. Create viewer at `src/components/viewer/[Type]Viewer.tsx`
5. Create config plugin at `src/components/configurator/plugins/[Type]Config.tsx`
6. Register in `Inspector.tsx`: add to generator dispatch + plugin mount logic
7. Register in `App.tsx`: add viewer to block routing
8. Add to `APP_STRUCTURE` in `appstructure.ts` with `typeId` + `defaultConstraints`
9. Add default constraints to `addBlockFromType` in `useWorksheetStore.tsx`
10. Mirror rendering in [WorksheetPDF.tsx](src/components/pdf/WorksheetPDF.tsx) using react-pdf primitives

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
  subType: 'kleuren' | 'herkennen' | 'hoeveelheid' | 'hoeveelheid-rechthoek' | 'lijnstuk' | 'veelhoek';
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
  exercises: Equation[];
  clockExercises?: ClockExercise[];
  fractionExercises?: FractionExercise[];
  splitsenExercises?: SplitsenExercise[];
  cijferExercises?: CijferExercise[];
  geldExercises?: GeldExercise[];
}
```

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

5. **Parallel logic** — mark code that must stay in sync with its twin in the other file.
   - Example: `// SYNC: mirror this change in WorksheetPDF.tsx renderAnalogClockPDF()`
   - This applies to anything in both `App.tsx` viewer components and `WorksheetPDF.tsx`

6. **No comment needed for:** standard React hooks usage, obvious state setters, self-explanatory JSX structure, imported library calls where the function name is clear.

Functions get at most one short sentence — only when the function name + parameter names don't tell the full story. No multi-line docblocks.
