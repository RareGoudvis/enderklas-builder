import { useWorksheetStore } from '../../../store/useWorksheetStore';
import type { MathBlock } from '../../../services/math/types';
import { sharedPluginStyles as styles } from './sharedPluginStyles';

interface Props {
    block: MathBlock;
}

const MAX_PRESETS: Array<10 | 20 | 100 | 1000> = [10, 20, 100, 1000];
const STYLE_OPTIONS: Array<{ val: 'symbolic' | 'realistic'; label: string }> = [
    { val: 'symbolic', label: 'Symbolisch (.|□)' },
    { val: 'realistic', label: 'Realistisch (Dienes)' },
];

// Per-place mask keys exposed to user, filtered by maxNumber range.
const placeKeysFor = (maxNumber: number): string[] => {
    if (maxNumber >= 1000) return ['D', 'H', 'T', 'E'];
    if (maxNumber >= 100)  return ['H', 'T', 'E'];
    if (maxNumber >= 20)   return ['T', 'E'];
    return ['E'];
};

export default function MabConfig({ block }: Props) {
    const updateBlockSettings = useWorksheetStore((state) => state.updateBlockSettings);

    const {
        mabStyle = 'symbolic',
        maxNumber = 100,
        operand1Mask = {},
        specifiekeGetallen = [],
        useSpecifiek = false,
        boxBorderColor = 'red',
        boxHeight = 100,
        allowInternalZero = true,
    } = block.constraints;

    const set = (key: string, value: unknown) =>
        updateBlockSettings(block.id, { constraints: { ...block.constraints, [key]: value } });

    const toggleMask = (k: string) => {
        const cur = operand1Mask || {};
        set('operand1Mask', { ...cur, [k]: !cur[k] });
    };

    const keys = placeKeysFor(maxNumber);

    return (
        <div style={styles.container}>

            {/* STYLE */}
            <div style={styles.section}>
                <label style={styles.label}>Stijl:</label>
                <div style={styles.buttonGroup}>
                    {STYLE_OPTIONS.map(o => (
                        <button key={o.val} onClick={() => set('mabStyle', o.val)} style={styles.radioBtn(mabStyle === o.val)}>
                            {o.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAX NUMBER */}
            <div style={styles.section}>
                <label style={styles.label}>Maximum getal:</label>
                <div style={styles.buttonGroup}>
                    {MAX_PRESETS.map(v => (
                        <button key={v} onClick={() => {
                            set('maxNumber', v);
                            // Drop mask keys that no longer apply to the new range so the
                            // generator doesn't try to satisfy an impossible constraint.
                            const allowed = new Set(placeKeysFor(v));
                            const cleaned: Record<string, boolean> = {};
                            for (const k of Object.keys(operand1Mask || {})) if (allowed.has(k)) cleaned[k] = operand1Mask[k];
                            set('operand1Mask', cleaned);
                        }} style={styles.radioBtn(maxNumber === v)}>
                            Tot {v.toLocaleString('nl-BE')}
                        </button>
                    ))}
                </div>
            </div>

            {/* SPECIFIC NUMBER GENERATOR — mask */}
            <div style={styles.section}>
                <label style={styles.label}>Specifieke getalopbouw:</label>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {keys.map(k => (
                        <button key={k} onClick={() => toggleMask(k)} style={maskBtnStyle(!!operand1Mask?.[k])}>
                            {k}
                        </button>
                    ))}
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '6px 0 0', fontStyle: 'italic' }}>
                    Aangevinkte posities verplicht ≥ 1.
                </p>
            </div>

            {/* SPECIFIC NUMBERS — manual list */}
            <div style={styles.section}>
                <label style={styles.label}>
                    <input
                        type="checkbox"
                        checked={!!useSpecifiek}
                        onChange={(e) => set('useSpecifiek', e.target.checked)}
                        style={{ marginRight: '6px', verticalAlign: 'middle' }}
                    />
                    Specifieke getallen (lijst)
                </label>
                {useSpecifiek && (
                    <input
                        type="text"
                        placeholder="Bv. 105, 231, 312"
                        value={Array.isArray(specifiekeGetallen) ? specifiekeGetallen.join(', ') : ''}
                        onChange={(e) => {
                            const list = e.target.value.split(/[,\s]+/).map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0);
                            set('specifiekeGetallen', list);
                        }}
                        style={textInputStyle}
                    />
                )}
            </div>

            {/* INTERNAL ZERO TOGGLE */}
            <div style={styles.section}>
                <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                        type="checkbox"
                        checked={allowInternalZero !== false}
                        onChange={(e) => set('allowInternalZero', e.target.checked)}
                    />
                    Getallen met tussennullen toelaten (bv. 105)
                </label>
            </div>

            {/* BOX BORDER COLOR */}
            <div style={styles.section}>
                <label style={styles.label}>Boxkleur:</label>
                <div style={styles.buttonGroup}>
                    <button onClick={() => set('boxBorderColor', 'red')} style={styles.radioBtn(boxBorderColor === 'red')}>Rood</button>
                    <button onClick={() => set('boxBorderColor', 'black')} style={styles.radioBtn(boxBorderColor === 'black')}>Zwart</button>
                </div>
            </div>

            {/* BOX HEIGHT */}
            <div style={styles.section}>
                <label style={styles.label}>Boxhoogte: {boxHeight}px</label>
                <input
                    type="range" min={60} max={200} step={5}
                    value={boxHeight}
                    onChange={(e) => set('boxHeight', Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
                />
            </div>

        </div>
    );
}

const maskBtnStyle = (active: boolean): React.CSSProperties => ({
    width: '32px', height: '32px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
    borderRadius: '4px', border: '1px solid var(--border-color)',
    backgroundColor: active ? 'var(--accent-purple)' : 'var(--bg-input)',
    color: active ? '#fff' : 'var(--text-muted)',
});

const textInputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)', borderRadius: '6px',
    color: 'var(--text-main)', outline: 'none', fontSize: '13px', boxSizing: 'border-box',
    marginTop: '6px',
};
