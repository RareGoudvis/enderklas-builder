import type { Fraction } from '../../services/math/types';

interface Props {
    value: Fraction;        // { whole?, n, d } — whole shown only for mixed numbers
    color?: string;         // solution colour; default black
    fontSize?: number;      // numerator/denominator size; default 15
    mono?: boolean;         // monospace (matches the fraction-shape viewers)
}

// Stacked numerator / bar / denominator, with an optional leading whole number for
// mixed numbers (e.g. 1¾). Single source for every vertical-fraction render.
export default function VerticalFraction({ value, color, fontSize = 15, mono = false }: Props) {
    const hasWhole = value.whole !== undefined && value.whole > 0;
    const cellMin = `${fontSize + 9}px`;
    const fontFamily = mono ? 'Azeret Mono, monospace' : undefined;
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', fontFamily, ...(color ? { color, fontWeight: 'bold' } : {}) }}>
            {hasWhole && <span style={{ fontSize: `${Math.round(fontSize * 1.2)}px`, marginRight: '4px', fontWeight: 'bold', ...(color ? { color } : {}) }}>{value.whole}</span>}
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', fontSize: `${fontSize}px`, lineHeight: 1.1, fontWeight: 'bold' }}>
                <span style={{ borderBottom: `1.5px solid ${color || '#000'}`, minWidth: cellMin, textAlign: 'center', padding: '0 4px' }}>{value.n}</span>
                <span style={{ minWidth: cellMin, textAlign: 'center', padding: '0 4px' }}>{value.d}</span>
            </div>
        </div>
    );
}
