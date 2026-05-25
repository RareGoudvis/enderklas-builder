import { useWorksheetStore } from '../../../store/useWorksheetStore';
import type { MathBlock, FractionSubType } from '../../../services/math/types';
import { sharedPluginStyles as styles } from './sharedPluginStyles';

interface Props { block: MathBlock; }

// Dropdown groups — "hoeveelheid" group maps to both hoeveelheid & hoeveelheid-rechthoek
type DropdownGroup = Exclude<FractionSubType, 'hoeveelheid' | 'hoeveelheid-rechthoek'> | 'hoeveelheid-groep';

const DROPDOWN_OPTIONS: { value: DropdownGroup; label: string }[] = [
    { value: 'kleuren',          label: 'Breuken kleuren' },
    { value: 'herkennen',        label: 'Breuken herkennen' },
    { value: 'tekenen',          label: 'Breuken tekenen' },
    { value: 'hoeveelheid-groep', label: 'Breuk van een hoeveelheid' },
    { value: 'lijnstuk',         label: 'Lijnstuk verdelen' },
];

const HOEVEELHEID_VARIANTS: { value: FractionSubType | null; label: string; description: string }[] = [
    { value: 'hoeveelheid',           label: 'Concreet',    description: 'Objecten (cirkels of vierkanten)' },
    { value: 'hoeveelheid-rechthoek', label: 'Schematisch', description: 'Lege rechthoek om in te delen' },
    { value: null,                    label: 'Abstract',    description: '(Binnenkort beschikbaar)' },
];

function defaultsFor(subType: FractionSubType): Record<string, unknown> {
    switch (subType) {
        case 'kleuren':   return { shape: 'square', minDenominator: 2, maxDenominator: 8 };
        case 'herkennen': return { shape: 'square', minDenominator: 2, maxDenominator: 8, answerFormat: 'fraction-questions' };
        case 'tekenen':   return { shape: 'square', minDenominator: 2, maxDenominator: 8 };
        case 'hoeveelheid':           return { objectShape: 'circle', minDenominator: 2, maxDenominator: 5, maxTotal: 20, answerFormat: 'met-hulp' };
        case 'hoeveelheid-rechthoek': return { minDenominator: 2, maxDenominator: 5, maxTotal: 20, answerFormat: 'met-berekening' };
        case 'lijnstuk':  return { minDenominator: 2, maxDenominator: 6, maxLineLength: 15, level: 1 };
    }
}

export default function FractionConfig({ block }: Props) {
    const updateBlockSettings = useWorksheetStore((state) => state.updateBlockSettings);

    const subType: FractionSubType = block.constraints.subType || 'kleuren';
    const c = block.constraints;

    const updateConstraint = (key: string, value: unknown) =>
        updateBlockSettings(block.id, { constraints: { ...c, [key]: value } });

    const handleSubTypeChange = (newSubType: FractionSubType) => {
        updateBlockSettings(block.id, {
            constraints: { subType: newSubType, ...defaultsFor(newSubType) },
            fractionExercises: [],
        });
    };

    const handleDropdownChange = (group: DropdownGroup) => {
        if (group === 'hoeveelheid-groep') {
            handleSubTypeChange('hoeveelheid');
        } else {
            handleSubTypeChange(group as FractionSubType);
        }
    };

    const isHoeveelheid      = subType === 'hoeveelheid';
    const isRechthoek        = subType === 'hoeveelheid-rechthoek';
    const isHoeveelheidGroep = isHoeveelheid || isRechthoek;
    const isShape      = ['kleuren', 'herkennen', 'tekenen'].includes(subType);
    const isAmount     = isHoeveelheidGroep;
    const isHerkennen  = subType === 'herkennen';
    const isLijnstuk   = subType === 'lijnstuk';

    const dropdownValue: DropdownGroup = isHoeveelheidGroep ? 'hoeveelheid-groep' : subType as DropdownGroup;

    return (
        <div style={styles.container}>

            {/* ── SUBTYPE DROPDOWN ── */}
            <div style={styles.section}>
                <label style={styles.label}>Type oefening:</label>
                <select
                    value={dropdownValue}
                    onChange={(e) => handleDropdownChange(e.target.value as DropdownGroup)}
                    style={selectStyle}
                >
                    {DROPDOWN_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* ── HOEVEELHEID VARIANT RADIO ── */}
            {isHoeveelheidGroep && (
                <div style={styles.section}>
                    <label style={styles.label}>Variant:</label>
                    {HOEVEELHEID_VARIANTS.map(({ value, label, description }) => {
                        const disabled = value === null;
                        const isActive = !disabled && subType === value;
                        return (
                            <button
                                key={label}
                                disabled={disabled}
                                onClick={() => value !== null && handleSubTypeChange(value)}
                                style={{
                                    ...styles.radioBtn(isActive),
                                    display: 'flex', flexDirection: 'column', width: '100%',
                                    marginBottom: '6px', textAlign: 'left', justifyContent: 'flex-start',
                                    opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
                                    padding: '8px 10px',
                                }}
                            >
                                <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{label}</span>
                                <span style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>{description}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── SHAPE (kleuren / herkennen / tekenen) ── */}
            {isShape && (
                <div style={styles.section}>
                    <label style={styles.label}>Vorm:</label>
                    <div style={styles.buttonGroup}>
                        {(['square', 'rectangle', 'circle'] as const)
                            .filter(s => !(subType === 'tekenen' && s === 'circle'))
                            .map(s => (
                                <button key={s} onClick={() => updateConstraint('shape', s)} style={styles.radioBtn(c.shape === s)}>
                                    {s === 'square' ? 'Vierkant' : s === 'rectangle' ? 'Rechthoek' : 'Cirkel'}
                                </button>
                            ))}
                    </div>
                </div>
            )}

            {/* ── OBJECT SHAPE (hoeveelheid) ── */}
            {isHoeveelheid && (
                <div style={styles.section}>
                    <label style={styles.label}>Objectvorm:</label>
                    <div style={styles.buttonGroup}>
                        <button onClick={() => updateConstraint('objectShape', 'circle')} style={styles.radioBtn(c.objectShape === 'circle')}>Cirkels</button>
                        <button onClick={() => updateConstraint('objectShape', 'square')} style={styles.radioBtn(c.objectShape === 'square')}>Vierkanten</button>
                    </div>
                </div>
            )}

            {/* ── DENOMINATOR RANGE ── */}
            <div style={styles.section}>
                <label style={styles.label}>Noemer bereik:</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ ...styles.label, marginBottom: '4px' }}>Min</label>
                        <input type="number" min="2" max={c.maxDenominator ?? 8}
                            value={c.minDenominator ?? 2}
                            onChange={(e) => updateConstraint('minDenominator', Math.min(Number(e.target.value), c.maxDenominator ?? 8))}
                            style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ ...styles.label, marginBottom: '4px' }}>Max</label>
                        <input type="number" min={c.minDenominator ?? 2} max={isLijnstuk ? 8 : isAmount ? 10 : 12}
                            value={c.maxDenominator ?? 8}
                            onChange={(e) => updateConstraint('maxDenominator', Math.max(Number(e.target.value), c.minDenominator ?? 2))}
                            style={inputStyle} />
                    </div>
                </div>
            </div>

            {/* ── MAX TOTAL (hoeveelheid / rechthoek) ── */}
            {isAmount && (
                <div style={styles.section}>
                    <label style={styles.label}>Max. aantal objecten:</label>
                    <input type="number" min="4" max="50" step="2"
                        value={c.maxTotal ?? 20}
                        onChange={(e) => updateConstraint('maxTotal', Number(e.target.value))}
                        style={inputStyle} />
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Totaal wordt deelbaar door de noemer.
                    </p>
                </div>
            )}

            {/* ── MAX LINE LENGTH (lijnstuk) ── */}
            {isLijnstuk && (
                <div style={styles.section}>
                    <label style={styles.label}>Max. lijnlengte (cm):</label>
                    <input type="number" min="4" max="20" step="1"
                        value={c.maxLineLength ?? 15}
                        onChange={(e) => updateConstraint('maxLineLength', Number(e.target.value))}
                        style={inputStyle} />
                </div>
            )}

            {/* ── ANSWER FORMAT (herkennen) ── */}
            {isHerkennen && (
                <div style={styles.section}>
                    <label style={styles.label}>Antwoordvorm:</label>
                    {[
                        { val: 'fraction-questions', label: 'Breukvragen' },
                        { val: 'phrase',             label: 'Zin invullen' },
                        { val: 'blank-fraction',     label: 'Blanco breuk' },
                        { val: 'line',               label: 'Blanco lijn' },
                    ].map(({ val, label }) => (
                        <button key={val} onClick={() => updateConstraint('answerFormat', val)}
                            style={{ ...styles.radioBtn(c.answerFormat === val), display: 'flex', width: '100%', marginBottom: '6px', textAlign: 'left', justifyContent: 'flex-start' }}>
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── ANSWER FORMAT (hoeveelheid) ── */}
            {isHoeveelheid && (
                <div style={styles.section}>
                    <label style={styles.label}>Antwoordvorm:</label>
                    {[
                        { val: 'met-hulp',        label: 'Met hulplijnen' },
                        { val: 'met-breukvragen', label: 'Met breukvragen' },
                        { val: 'zonder-hulp',     label: 'Zonder hulp' },
                    ].map(({ val, label }) => (
                        <button key={val} onClick={() => updateConstraint('answerFormat', val)}
                            style={{ ...styles.radioBtn(c.answerFormat === val), display: 'flex', width: '100%', marginBottom: '6px', textAlign: 'left', justifyContent: 'flex-start' }}>
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── ANSWER FORMAT (hoeveelheid-rechthoek) ── */}
            {isRechthoek && (
                <div style={styles.section}>
                    <label style={styles.label}>Niveau:</label>
                    {[
                        { val: 'met-berekening',    label: 'Met berekeningslijnen' },
                        { val: 'zonder-berekening', label: 'Zonder berekeningslijnen' },
                    ].map(({ val, label }) => (
                        <button key={val} onClick={() => updateConstraint('answerFormat', val)}
                            style={{ ...styles.radioBtn(c.answerFormat === val), display: 'flex', width: '100%', marginBottom: '6px', textAlign: 'left', justifyContent: 'flex-start' }}>
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── LEVEL (lijnstuk) ── */}
            {isLijnstuk && (
                <div style={styles.section}>
                    <label style={styles.label}>Niveau:</label>
                    {[
                        { val: 1, label: 'Niveau 1 — Volledige vraagstelling' },
                        { val: 2, label: 'Niveau 2 — Berekeningslijnen' },
                        { val: 3, label: 'Niveau 3 — Blanco lijnen' },
                    ].map(({ val, label }) => (
                        <button key={val} onClick={() => updateConstraint('level', val)}
                            style={{ ...styles.radioBtn(c.level === val), display: 'flex', width: '100%', marginBottom: '6px', textAlign: 'left', justifyContent: 'flex-start' }}>
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#1a1a1f',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'white',
    outline: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' strokeWidth='1.5' fill='none'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '32px',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    backgroundColor: '#1a1a1f',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'white',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box',
};
