import { useWorksheetStore } from '../../../store/useWorksheetStore';
import type { MathBlock } from '../../../services/math/types';
import { getMaskPlaces } from '../../../services/math/mathEngine';
import { ROUND_TARGETS } from '../../../services/afronden/afrondenGenerator';
import { sharedPluginStyles as styles } from './sharedPluginStyles';

interface Props { block: MathBlock; }

const MAX_PRESETS = [100, 1000, 10000, 100000, 1000000];

export default function AfrondenConfig({ block }: Props) {
    const updateBlockSettings = useWorksheetStore((state) => state.updateBlockSettings);
    const { maxGetal = 1000, numberMask = {}, roundTargets = ['T', 'H'] } = block.constraints;

    const set = (key: string, value: unknown) =>
        updateBlockSettings(block.id, { constraints: { ...block.constraints, [key]: value } });
    const toggleMask = (k: string) => set('numberMask', { ...numberMask, [k]: !numberMask[k] });
    const toggleTarget = (k: string) => {
        const next = roundTargets.includes(k) ? roundTargets.filter((x: string) => x !== k) : [...roundTargets, k];
        if (next.length) set('roundTargets', next);   // keep ≥1
    };
    const places = getMaskPlaces(maxGetal, 'natural');
    const usableTargets = ROUND_TARGETS.filter(t => t.weight < maxGetal);

    return (
        <div style={styles.container}>
            <div style={styles.section}>
                <label style={styles.label}>Maximum getal:</label>
                <div style={styles.buttonGroup}>
                    {MAX_PRESETS.map(val => (
                        <button key={val} onClick={() => set('maxGetal', val)} style={styles.radioBtn(maxGetal === val)}>Tot {val.toLocaleString('nl-BE')}</button>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <label style={styles.label}>Afronden op:</label>
                <div style={styles.buttonGroup}>
                    {usableTargets.map(t => (
                        <button key={t.key} onClick={() => toggleTarget(t.key)} style={styles.pill(roundTargets.includes(t.key))}>op {t.label}</button>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <label style={styles.label}>Specifieke getalopbouw:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {places.map(p => (
                        <button key={p.key} onClick={() => toggleMask(p.key)} style={maskBtnStyle(!!numberMask[p.key])} title={p.label}>{p.key}</button>
                    ))}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '4px 0 0' }}>Leeg = vrije opbouw.</p>
            </div>
        </div>
    );
}

// Canonical mask button — see UI-GUIDE.md.
const maskBtnStyle = (active: boolean): React.CSSProperties => ({
    width: '28px', height: '28px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer',
    border: '1px solid var(--border-color)',
    backgroundColor: active ? 'var(--accent-purple)' : 'var(--bg-input)',
    color: active ? '#fff' : 'var(--text-muted)',
});
