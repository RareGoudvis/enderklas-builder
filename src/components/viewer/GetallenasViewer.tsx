import type { MathBlock, GetallenasExercise, Fraction } from '../../services/math/types';
import { formatMathNumber } from '../../services/math/formatters';
import FragmentableGrid from './FragmentableGrid';
import VerticalFraction from './VerticalFraction';

interface Props {
    block: MathBlock;
    showSolutions: boolean;
}

const mono = "'Azeret Mono', monospace";
const isFrac = (v: number | Fraction): v is Fraction => typeof v !== 'number';

function label(v: number | Fraction, color?: string) {
    if (isFrac(v)) return <VerticalFraction value={v} color={color} fontSize={13} mono />;
    return <span style={{ fontSize: '15px', fontWeight: 'normal', color: color || '#000', fontFamily: mono }}>{formatMathNumber(v)}</span>;
}

function NumberLine({ ex, showSolutions }: { ex: GetallenasExercise; showSolutions: boolean }) {
    const { tickCount, blankMask, direction } = ex;
    const arrowLeft = direction === 'left';
    // Tick values: precomputed (decimal/rational/geheel) or derived (legacy natural).
    const values: (number | Fraction)[] = ex.values && ex.values.length
        ? ex.values
        : Array.from({ length: tickCount }, (_, i) => (arrowLeft ? ex.start - i * ex.step : ex.start + i * ex.step));
    const hasFrac = values.some(isFrac);

    const pad = 24;
    const gap = 96;
    const W = pad * 2 + gap * (tickCount - 1);
    const axisY = 30;
    const H = hasFrac ? 88 : 70;
    const tickX = (i: number) => pad + i * gap;

    return (
        <div style={{ position: 'relative', width: W, height: H, fontFamily: mono }}>
            <svg width={W} height={H} style={{ display: 'block', position: 'absolute', inset: 0 }}>
                <line x1={pad - 12} y1={axisY} x2={W - pad + 12} y2={axisY} stroke="#000" strokeWidth="1.5" />
                {arrowLeft
                    ? <polygon points={`${pad - 12},${axisY} ${pad - 4},${axisY - 5} ${pad - 4},${axisY + 5}`} fill="#000" />
                    : <polygon points={`${W - pad + 12},${axisY} ${W - pad + 4},${axisY - 5} ${W - pad + 4},${axisY + 5}`} fill="#000" />}
                {Array.from({ length: tickCount }, (_, i) => {
                    const x = tickX(i);
                    return <line key={i} x1={x} y1={axisY - 7} x2={x} y2={axisY + 7} stroke="#000" strokeWidth="1.5" />;
                })}
            </svg>
            {/* HTML label layer (so fractions can render vertically) */}
            {values.map((v, i) => {
                const blank = blankMask[i];
                return (
                    <div key={i} style={{ position: 'absolute', left: tickX(i), top: axisY + 12, transform: 'translateX(-50%)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                        {blank
                            ? (showSolutions ? label(v, '#e11d48') : <span style={{ borderBottom: '1.5px solid #000', display: 'inline-block', width: '32px', height: '16px' }} />)
                            : label(v)}
                    </div>
                );
            })}
        </div>
    );
}

export default function GetallenasViewer({ block, showSolutions }: Props) {
    const exercises = block.getallenasExercises || [];
    const gap = block.verticalSpacing || 14;

    if (exercises.length === 0) {
        return <div className="no-print" style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '14px', padding: '8px 0' }}>(Genereer oefeningen via het rechterpaneel)</div>;
    }

    return (
        <FragmentableGrid
            cols={1}
            rowGap={gap + 10}
            items={exercises.map((ex) => (
                <div key={ex.id} className="print-exercise">
                    <NumberLine ex={ex} showSolutions={showSolutions} />
                </div>
            ))}
        />
    );
}
