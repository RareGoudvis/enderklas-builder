import { useWorksheetStore } from '../../../store/useWorksheetStore';
import { sharedPluginStyles as S } from './sharedPluginStyles';
import type { MathBlock } from '../../../services/math/types';
import { DENOMINATION_CATALOGUE, denominationLabel } from '../../../services/geld/geldGenerator';

const ALL_PLACE_VALUES = ['D', 'H', 'T', 'E', 't', 'h'];

const pill = (active: boolean): React.CSSProperties => ({
    padding: '4px 8px', fontSize: '11px', borderRadius: '12px', cursor: 'pointer',
    border: '1px solid var(--border-color)',
    backgroundColor: active ? 'var(--accent-purple)' : 'var(--bg-input)',
    color: active ? 'white' : 'var(--text-muted)',
    fontWeight: active ? 'bold' : 'normal',
    transition: 'all 0.15s', userSelect: 'none',
});

const toggle = (active: boolean): React.CSSProperties => ({
    width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer', border: 'none',
    backgroundColor: active ? 'var(--accent-purple)' : 'var(--bg-input)',
    position: 'relative', flexShrink: 0, transition: 'background 0.15s',
});

export default function GeldConfig({ block }: { block: MathBlock }) {
    const updateBlockSettings = useWorksheetStore(s => s.updateBlockSettings);
    const isHerkennen = block.typeId === 'geld-herkennen';

    const c = block.constraints;
    const set = (key: string, val: unknown) =>
        updateBlockSettings(block.id, { constraints: { ...c, [key]: val } });

    const maxGetal: number = c.maxGetal ?? 10;
    const showPlaceValues: boolean = c.showPlaceValues ?? false;
    const placeValues: string[] = c.placeValues ?? ['T', 'E'];
    const allowedDenominations: number[] = c.allowedDenominations ?? DENOMINATION_CATALOGUE.map(d => d.valueCents);

    const toggleDenom = (valueCents: number) => {
        const next = allowedDenominations.includes(valueCents)
            ? allowedDenominations.filter(v => v !== valueCents)
            : [...allowedDenominations, valueCents];
        set('allowedDenominations', next);
        const voorbeeldTypes: number[] = c.voorbeeldTypes ?? [];
        if (!next.includes(valueCents) && voorbeeldTypes.includes(valueCents)) {
            set('voorbeeldTypes', voorbeeldTypes.filter(v => v !== valueCents));
        }
    };

    const togglePV = (pv: string) => {
        const next = placeValues.includes(pv)
            ? placeValues.filter(p => p !== pv)
            : [...placeValues, pv];
        set('placeValues', next);
    };

    return (
        <div style={S.container}>

            {/* ── Maximum getal ── */}
            <div style={S.section}>
                <label style={S.label}>Maximum getal</label>
                <div style={S.buttonGroup}>
                    {[10, 20, 100, 1000].map(v => (
                        <button key={v} style={S.radioBtn(maxGetal === v)} onClick={() => set('maxGetal', v)}>
                            Tot {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Toegestane coupures ── */}
            <div style={S.section}>
                <label style={S.label}>Toegestane coupures</label>
                <div style={{ marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>Biljetten</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {DENOMINATION_CATALOGUE.filter(d => d.type === 'bill').map(d => (
                        <span key={d.valueCents} style={pill(allowedDenominations.includes(d.valueCents))} onClick={() => toggleDenom(d.valueCents)}>
                            {denominationLabel(d.valueCents)}
                        </span>
                    ))}
                </div>
                <div style={{ marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>Munten (€)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {DENOMINATION_CATALOGUE.filter(d => d.type === 'euro-coin').map(d => (
                        <span key={d.valueCents} style={pill(allowedDenominations.includes(d.valueCents))} onClick={() => toggleDenom(d.valueCents)}>
                            {denominationLabel(d.valueCents)}
                        </span>
                    ))}
                </div>
                <div style={{ marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>Munten (ct)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {DENOMINATION_CATALOGUE.filter(d => d.type === 'cent-coin').map(d => (
                        <span key={d.valueCents} style={pill(allowedDenominations.includes(d.valueCents))} onClick={() => toggleDenom(d.valueCents)}>
                            {denominationLabel(d.valueCents)}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Hoeveelheid (herkennen only) ── */}
            {isHerkennen && (
                <div style={S.section}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ ...S.label, marginBottom: 0 }}>Hoeveelheid (D H T E t h)</label>
                        <button style={toggle(showPlaceValues)} onClick={() => set('showPlaceValues', !showPlaceValues)} />
                    </div>
                    {showPlaceValues && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {ALL_PLACE_VALUES.map(pv => (
                                <span key={pv} style={pill(placeValues.includes(pv))} onClick={() => togglePV(pv)}>{pv}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
