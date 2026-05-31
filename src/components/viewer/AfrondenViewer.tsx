import type { MathBlock, AfrondenExercise } from '../../services/math/types';
import { formatMathNumber } from '../../services/math/formatters';
import { ROUND_TARGETS, roundTo } from '../../services/afronden/afrondenGenerator';
import FragmentableGrid from './FragmentableGrid';

interface Props {
    block: MathBlock;
    showSolutions: boolean;
}

const mono = "'Azeret Mono', monospace";
const SOL = '#e11d48';
const SALMON = '#f4cbb8';

export default function AfrondenViewer({ block, showSolutions }: Props) {
    const exercises: AfrondenExercise[] = block.afrondenExercises || [];
    const subType: string = block.constraints.subType ?? 'rooster';
    const maxGetal: number = block.constraints.maxGetal ?? 1000;
    const targetKeys: string[] = block.constraints.roundTargets ?? ['T', 'H'];
    const gap = block.verticalSpacing || 14;
    const targets = ROUND_TARGETS.filter(t => targetKeys.includes(t.key) && t.weight < maxGetal);
    const cols = targets.length ? targets : [ROUND_TARGETS[0]];

    if (exercises.length === 0) {
        return <div className="no-print" style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '14px', padding: '8px 0' }}>(Genereer oefeningen via het rechterpaneel)</div>;
    }

    // ── SIMPEL: getal ≈ ____ (op <plaats>) ────────────────────────────────────
    if (subType === 'simpel') {
        return (
            <FragmentableGrid
                cols={2}
                columnGap={24}
                rowGap={gap}
                items={exercises.map(ex => {
                    const t = ROUND_TARGETS.find(x => x.key === ex.targetKey) ?? ROUND_TARGETS[0];
                    return (
                        <div key={ex.id} className="print-exercise" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', fontFamily: mono, fontSize: '16px', flexWrap: 'wrap' }}>
                            <span>{formatMathNumber(ex.number)} ≈</span>
                            {showSolutions
                                ? <span style={{ color: SOL }}>{formatMathNumber(roundTo(ex.number, t.weight))}</span>
                                : <span style={{ borderBottom: '1.5px solid #000', minWidth: '70px', height: '16px', display: 'inline-block' }} />}
                            <span style={{ fontSize: '12px', color: '#555' }}>(op {t.label})</span>
                        </div>
                    );
                })}
            />
        );
    }

    // ── ROOSTER: number rows × round-to columns ───────────────────────────────
    const grid = `120px ${cols.map(() => '110px').join(' ')}`;
    const cell: React.CSSProperties = {
        border: '1px solid #000', height: '34px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: mono, fontSize: '15px', boxSizing: 'border-box',
    };
    return (
        <div>
            <div className="print-row" style={{ display: 'grid', gridTemplateColumns: grid }}>
                <div style={{ ...cell, backgroundColor: SALMON, fontWeight: 'bold' }}>afronden</div>
                {cols.map(t => <div key={t.key} style={{ ...cell, backgroundColor: SALMON, fontWeight: 'bold', fontSize: '12px' }}>op {t.label}</div>)}
            </div>
            {exercises.map(ex => (
                <div key={ex.id} className="print-row print-exercise" style={{ display: 'grid', gridTemplateColumns: grid }}>
                    <div style={{ ...cell, backgroundColor: SALMON, fontWeight: 'bold' }}>{formatMathNumber(ex.number)}</div>
                    {cols.map(t => (
                        <div key={t.key} style={{ ...cell, color: SOL }}>
                            {showSolutions ? formatMathNumber(roundTo(ex.number, t.weight)) : ''}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
