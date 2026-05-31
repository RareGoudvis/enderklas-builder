# UI-GUIDE.md — design tokens & canonical component styles

Single source of truth for colors and component styling in this app. **Read this before
adding or restyling any UI.** It exists because controls kept drifting (e.g. a mask menu
with a hardcoded `#222226` that broke in light/colorblind themes).

> Golden rule: **never hardcode a background, text, border, or accent hex.** Use a CSS
> variable so all three themes work. The only sanctioned hex literals are the
> "worksheet-ink" colors in §3 (they must print identically across themes).

---

## 1. Design tokens (CSS variables)

Defined in [src/assets/theme.css](src/assets/theme.css). Selected via `data-theme` on
`<html>` (`dark` default, `light`, `colorblind`). Always reference as
`var(--token)` — never the raw hex.

| Token | Dark | Light | Colorblind | Use for |
|---|---|---|---|---|
| `--bg-dark` | `#0f0f12` | `#eeede6` | `#ffffff` | page / sidebar background |
| `--bg-panel` | `#16161a` | `#fafaf7` | `#ffffff` | card / panel background |
| `--bg-input` | `#2a2a33` | `#f0efe8` | `#ffffff` | input + (inactive) button background |
| `--text-main` | `#ffffff` | `#1a1a14` | `#000000` | primary text |
| `--text-muted` | `#b8b8c8` | `#6b6a5e` | `#000000` | labels / secondary text |
| `--border-color` | `#3a3a48` | `#d4d2c8` | `#000000` | borders / dividers |
| `--accent-purple` | `#ac29e9` | `#c48b00` | `#000000` | **primary accent** — active buttons, highlights |
| `--accent-purple-dark` | `#3f0c5d` | `#3d2a00` | `#000000` | darker accent variant |
| `--accent-getallenkennis` | `#f05252` | `#d93b3b` | `#DC267F` | domain tag: Getallenkennis |
| `--accent-bewerkingen` | `#4d7fff` | `#2d63e0` | `#648FFF` | domain tag: Bewerkingen |
| `--accent-metendrekenen` | `#3db870` | `#1f9950` | `#FE6100` | domain tag: Meten & metend rekenen |
| `--accent-meetkunde` | `#b06eff` | `#8040d0` | `#785EF0` | domain tag: Meetkunde |
| `--accent-vraagstukken` | `#e0a030` | `#c87f1a` | `#FFB000` | domain tag: Vraagstukken |

Notes: the primary accent is **not** always purple — it's gold in light, black in
colorblind. That's exactly why active states must use `var(--accent-purple)`, never `#ac29e9`.
Domain accents come from `Domain.accentVar` in [appstructure.ts](src/config/appstructure.ts).

---

## 2. Canonical component styles (reuse these — don't invent local copies)

### Config-plugin helpers — [sharedPluginStyles.ts](src/components/configurator/plugins/sharedPluginStyles.ts)
`import { sharedPluginStyles as styles }`.
- `styles.section` — `{ marginBottom: 24 }`, wraps one control group.
- `styles.label` — section heading (13px, `--text-muted`).
- `styles.buttonGroup` — `{ display:flex, gap:8, flexWrap:wrap }`.
- `styles.radioBtn(active)` — full-width segmented option (one choice of N).
- `styles.pill(active)` — rounded multi-select toggle (independent on/off).
- `styles.onOffRow` / `styles.onOffLabel` / `styles.onOffBtn(on)` — labelled on/off switch.

### Inspector chrome — `S` object in [Inspector.tsx](src/components/configurator/Inspector.tsx)
`S.card`, `S.cardTitle`, `S.label`, `S.btnGroup`, `S.radioBtn(active)`, `S.input`,
`S.select`, `S.checkbox`, `S.advancedToggle` (the "Geavanceerd" accordion). Section order in
the right panel: **Opdrachtblok → Engine (Config plugin) → Differentiatie → Geavanceerd**.

### Mask-button canon (place-value "Specifieke getalopbouw" TD D H T E …)
Every config that shows place-value masks uses **exactly** this — copy it verbatim:
```ts
const maskBtnStyle = (active: boolean): React.CSSProperties => ({
  width: 28, height: 28, fontSize: 10, fontWeight: 'bold', borderRadius: 4, cursor: 'pointer',
  border: '1px solid var(--border-color)',
  backgroundColor: active ? 'var(--accent-purple)' : 'var(--bg-input)',
  color: active ? '#fff' : 'var(--text-muted)',
});
```
Wrap the block in `styles.section` + `styles.label`; factor-label width 56px, row
`marginBottom:10`, mask `gap:6`. (Reference: SplitsenConfig.tsx, addition/NaturalSettings.tsx.)
Mask data + helpers (`PLACE_VALUES`, `getMaskPlaces`, `generateMaskedInt`,
`numberMatchesMask`) live in [mathEngine.ts](src/services/math/mathEngine.ts).

### IconButton — [IconButton.tsx](src/components/ui/IconButton.tsx)
32px tall; variants: `primary` (accent bg/white), `neutral` (input bg/main text, default),
`danger` (`rgba(225,29,72,.12)` bg, `#e11d48`), `active` (`rgba(172,41,233,.15)` bg, accent).

### Other reusable building blocks
- nl-BE number formatting → `formatMathNumber` ([formatters.ts](src/services/math/formatters.ts)); preset buttons use `val.toLocaleString('nl-BE')`.
- maxGetal preset row → copy `MAX_PRESETS` + button map from SplitsenConfig.
- Rooster/grid viewer → `display:grid` + 64px cells + salmon header ([DeelbaarheidViewer.tsx](src/components/viewer/DeelbaarheidViewer.tsx)); place-value table in [SplitsenViewer.tsx](src/components/viewer/SplitsenViewer.tsx).
- Circle/object grid → `objEl` + `groupRows` in [FractionExerciseItem.tsx](src/components/viewer/FractionExerciseItem.tsx).
- Page-safe multi-item flow → [FragmentableGrid](src/components/viewer/FragmentableGrid.tsx).

---

## 3. Sanctioned "worksheet-ink" colors (intentionally hardcoded)

These render on the printed A4 and must look the same in every theme, so they are **not**
tokens. Reuse these exact values — don't pick new ones:

| Color | Hex | Use |
|---|---|---|
| Solution red | `#e11d48` | anything that turns red under "Toon oplossingen" |
| Fraction fill | `#93c5fd` | colored part of fraction shapes / tinted grid cells |
| Rooster/splitsen salmon | `#f4cbb8` | table header / place-value box background |
| MAB units | `#fbbf24` | Dienes blocks (eenheden) |
| MAB tens | `#22c55e` | Dienes blocks (tientallen) |
| MAB hundreds | `#ef4444` | Dienes blocks (honderdtallen) |
| MAB thousands | `#3b82f6` | Dienes blocks (duizendtallen) |
| Ink black | `#000` | outlines, rules, answer lines |

---

## 4. Checklist for any new config / UI control

1. Backgrounds / text / borders / accents → `var(--token)`, never raw hex.
2. Reuse a `sharedPluginStyles` / Inspector `S` helper before writing a local style object.
3. Place-value masks → the mask-button canon above (28×28, bg-input, 1px border).
4. Worksheet ink → the §3 table values.
5. Eyeball the result in **all three themes** (dark / light / colorblind) before committing.
