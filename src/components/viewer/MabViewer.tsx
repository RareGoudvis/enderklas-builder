import type { MathBlock, MabExercise, MabStyle, MabScaffolding } from '../../services/math/types';
import MabBlocksSVG from './MabBlocksSVG';

interface Props {
    block: MathBlock;
    showSolutions: boolean;
}

const fmt = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export default function MabViewer({ block, showSolutions }: Props) {
    const exercises: MabExercise[] = block.mabExercises || [];
    if (exercises.length === 0) {
        return (
            <div className="no-print" style={{ padding: '8px 0', fontStyle: 'italic', color: '#999', fontSize: '14px' }}>
                (Genereer oefeningen via het rechterpaneel)
            </div>
        );
    }

    const c = block.constraints;
    const style: MabStyle = c.mabStyle || 'symbolic';
    const maxNumber: number = c.maxNumber || 100;
    const scaffolding: MabScaffolding = c.scaffolding || 'lijn';
    const perRow: number = c.exercisesPerRow || 3;
    const borderColor: string = c.boxBorderColor === 'black' ? '#000' : '#dc2626';
    const boxHeight: number = c.boxHeight || 100;
    const gap = block.verticalSpacing || 14;

    const cols = maxNumber >= 1000 ? ['D', 'H', 'T', 'E'] : maxNumber >= 100 ? ['H', 'T', 'E'] : maxNumber >= 20 ? ['T', 'E'] : ['E'];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${perRow}, 1fr)`, gap: `${gap}px`, width: '100%' }}>
            {exercises.map(ex => (
                <MabItem
                    key={ex.id}
                    ex={ex}
                    style={style}
                    scaffolding={scaffolding}
                    cols={cols}
                    borderColor={borderColor}
                    boxHeight={boxHeight}
                    showSolutions={showSolutions}
                />
            ))}
        </div>
    );
}

interface ItemProps {
    ex: MabExercise;
    style: MabStyle;
    scaffolding: MabScaffolding;
    cols: string[];
    borderColor: string;
    boxHeight: number;
    showSolutions: boolean;
}

function MabItem({ ex, style, scaffolding, cols, borderColor, boxHeight, showSolutions }: ItemProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
                width: '100%',
                height: `${boxHeight}px`,
                border: `1.5px solid ${borderColor}`,
                borderRadius: '8px',
                padding: '8px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <MabBlocksSVG
                    thousands={ex.thousands}
                    hundreds={ex.hundreds}
                    tens={ex.tens}
                    units={ex.units}
                    style={style}
                />
            </div>
            {scaffolding === 'lijn'
                ? <AnswerLine value={ex.value} showSolutions={showSolutions} />
                : <AnswerTable value={ex.value} cols={cols} showSolutions={showSolutions} thousands={ex.thousands} hundreds={ex.hundreds} tens={ex.tens} units={ex.units} />
            }
        </div>
    );
}

function AnswerLine({ value, showSolutions }: { value: number; showSolutions: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', minHeight: '24px', fontFamily: "'Azeret Mono', monospace" }}>
            {showSolutions
                ? <span style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '15px' }}>{fmt(value)}</span>
                : <div style={{ width: '60%', borderBottom: '1.5px dotted #000', height: '20px' }} />
            }
        </div>
    );
}

function AnswerTable({ cols, showSolutions, thousands, hundreds, tens, units }: {
    value: number; cols: string[]; showSolutions: boolean;
    thousands: number; hundreds: number; tens: number; units: number;
}) {
    const digits: Record<string, number> = { D: thousands, H: hundreds, T: tens, E: units };
    const cellW = 28;
    return (
        <table style={{ borderCollapse: 'collapse', fontFamily: "'Azeret Mono', monospace" }}>
            <thead>
                <tr>
                    {cols.map(c => (
                        <th key={c} style={{ border: '1px solid #000', width: `${cellW}px`, height: '20px', fontSize: '11px', fontWeight: 'bold', background: '#f3f4f6' }}>{c}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr>
                    {cols.map(c => (
                        <td key={c} style={{
                            border: '1px solid #000',
                            width: `${cellW}px`,
                            height: '26px',
                            textAlign: 'center',
                            fontSize: '14px',
                            color: showSolutions ? '#e11d48' : 'transparent',
                            fontWeight: 'bold',
                        }}>
                            {digits[c]}
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );
}
