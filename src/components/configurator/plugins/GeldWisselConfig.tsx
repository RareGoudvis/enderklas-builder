import { useWorksheetStore } from '../../../store/useWorksheetStore';
import { sharedPluginStyles as S } from './sharedPluginStyles';
import type { MathBlock } from '../../../services/math/types';
import { DENOMINATION_CATALOGUE, denominationLabel } from '../../../services/geld/geldGenerator';

const pill = (active: boolean): React.CSSProperties => ({
    padding: '4px 8px', fontSize: '11px', borderRadius: '12px', cursor: 'pointer',
    border: '1px solid var(--border-color)',
    backgroundColor: active ? 'var(--accent-purple)' : 'var(--bg-input)',
    color: active ? 'white' : 'var(--text-muted)',
    fontWeight: active ? 'bold' : 'normal',
    transition: 'all 0.15s', userSelect: 'none',
});

const EXERCISE_LABELS = ['links', 'rechts', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function GeldWisselConfig({ block }: { block: MathBlock }) {
    const updateBlockSettings = useWorksheetStore(s => s.updateBlockSettings);
    const c = block.constraints;
    const n = block.numberOfExercises || 4;

    const exerciseBills: number[] = c.exerciseBills ?? [500];

    const setBill = (i: number, valueCents: number) => {
        const next = [...exerciseBills];
        // fill gaps if array is shorter than i
        while (next.length <= i) next.push(next[next.length - 1] ?? 500);
        next[i] = valueCents;
        updateBlockSettings(block.id, { constraints: { ...c, exerciseBills: next } });
    };

    return (
        <div style={S.container}>
            {Array.from({ length: n }, (_, i) => {
                const current = exerciseBills[i] ?? exerciseBills[exerciseBills.length - 1] ?? 500;
                const label = EXERCISE_LABELS[i] ?? `${i + 1}`;
                return (
                    <div key={i} style={{ ...S.section, marginBottom: '10px' }}>
                        <label style={S.label}>Oefening {label}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {DENOMINATION_CATALOGUE.map(d => (
                                <span key={d.valueCents} style={pill(current === d.valueCents)}
                                    onClick={() => setBill(i, d.valueCents)}>
                                    {denominationLabel(d.valueCents)}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
