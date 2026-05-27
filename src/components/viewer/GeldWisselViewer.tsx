import type { MathBlock, GeldWisselExercise } from '../../services/math/types';
import { Bill } from './GeldViewer';

function WisselCell({ ex, boxHeight }: { ex: GeldWisselExercise; boxHeight: number }) {
    return (
        <div className="print-exercise" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', boxSizing: 'border-box' }}>
            <div style={{ flexShrink: 0 }}>
                <Bill valueCents={ex.billValueCents} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Azeret Mono', monospace", flexShrink: 0 }}>
                =
            </div>
            <div style={{ flex: 1, height: `${boxHeight}px`, border: '2px solid #000', boxSizing: 'border-box', borderRadius: '6px' }} />
        </div>
    );
}

interface Props { block: MathBlock; showSolutions: boolean; }

export default function GeldWisselViewer({ block, showSolutions: _showSolutions }: Props) {
    const exercises: GeldWisselExercise[] = block.geldWisselExercises || [];
    const gap: number = block.verticalSpacing || 14;
    const exercisesPerRow: number = block.constraints.exercisesPerRow ?? 2;
    const boxHeight: number = block.constraints.boxHeight ?? 100;

    if (exercises.length === 0) {
        return <div className="no-print" style={{ padding: '8px 0', fontStyle: 'italic', color: '#999', fontSize: '14px' }}>(Genereer oefeningen via het rechterpaneel)</div>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${exercisesPerRow}, 1fr)`, gap: `${gap}px` }}>
            {exercises.map(ex => (
                <WisselCell key={ex.id} ex={ex} boxHeight={boxHeight} />
            ))}
        </div>
    );
}
