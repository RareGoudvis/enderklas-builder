import type { MathBlock, GeldExercise, GeldDenomination } from '../../services/math/types';
import { DENOMINATION_CATALOGUE, formatAmount, denominationLabel } from '../../services/geld/geldGenerator';

// ── SVG helpers (print-friendly: white fill, black outline, no colour) ────────

function billText(valueCents: number): string { return `${valueCents / 100}`; }
function coinText(valueCents: number): string { return valueCents >= 100 ? `${valueCents / 100}` : `${valueCents}`; }

function Bill({ valueCents }: { valueCents: number }) {
    return (
        <svg width="70" height="40" viewBox="0 0 70 40">
            <rect x="1.5" y="1.5" width="67" height="37" rx="4" ry="4" fill="white" stroke="#000" strokeWidth="2" />
            <text x="35" y="25" textAnchor="middle" fontSize="13" fontWeight="bold"
                fontFamily="'Azeret Mono', monospace" fill="#000">
                {billText(valueCents)}
            </text>
        </svg>
    );
}

function EuroCoin({ valueCents }: { valueCents: number }) {
    return (
        <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="20" fill="white" stroke="#000" strokeWidth="2" />
            <circle cx="22" cy="22" r="14" fill="white" stroke="#000" strokeWidth="1.5" />
            <text x="22" y="27" textAnchor="middle" fontSize="11" fontWeight="bold"
                fontFamily="'Azeret Mono', monospace" fill="#000">
                {coinText(valueCents)}
            </text>
        </svg>
    );
}

function CentCoin({ valueCents }: { valueCents: number }) {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="white" stroke="#000" strokeWidth="1.5" />
            <text x="18" y="23" textAnchor="middle" fontSize="10" fontWeight="bold"
                fontFamily="'Azeret Mono', monospace" fill="#000">
                {coinText(valueCents)}
            </text>
        </svg>
    );
}

function DenomItem({ denom }: { denom: GeldDenomination }) {
    const items = Array.from({ length: denom.count }, (_, i) => {
        if (denom.type === 'bill') return <Bill key={i} valueCents={denom.valueCents} />;
        if (denom.type === 'euro-coin') return <EuroCoin key={i} valueCents={denom.valueCents} />;
        return <CentCoin key={i} valueCents={denom.valueCents} />;
    });
    return <>{items}</>;
}

// ── Voorbeelden bar ───────────────────────────────────────────────────────────

export function VoorbeeldenBar({ allowedDenominations, voorbeeldTypes }: { allowedDenominations: number[]; voorbeeldTypes: number[] }) {
    const toShow = DENOMINATION_CATALOGUE.filter(
        d => allowedDenominations.includes(d.valueCents) && voorbeeldTypes.includes(d.valueCents)
    );
    if (toShow.length === 0) return null;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', padding: '8px 0 12px', borderBottom: '1px solid #e5e7eb', marginBottom: '12px' }}>
            {toShow.map(d => (
                <div key={d.valueCents} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    {d.type === 'bill' && <Bill valueCents={d.valueCents} />}
                    {d.type === 'euro-coin' && <EuroCoin valueCents={d.valueCents} />}
                    {d.type === 'cent-coin' && <CentCoin valueCents={d.valueCents} />}
                    <span style={{ fontSize: '10px', fontFamily: "'Azeret Mono', monospace", color: '#555' }}>
                        {denominationLabel(d.valueCents)}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ── Per-exercise cell ─────────────────────────────────────────────────────────

function HerkennenCell({ ex, block, showSolutions }: { ex: GeldExercise; block: MathBlock; showSolutions: boolean }) {
    const format: string = block.constraints.format ?? 'euros';
    const scaffolding: string = block.constraints.scaffolding ?? 'invullen';
    const showPlaceValues: boolean = block.constraints.showPlaceValues ?? false;
    const placeValues: string[] = block.constraints.placeValues ?? ['T', 'E'];

    const answerArea = showSolutions ? (
        <div style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '16px', fontFamily: "'Azeret Mono', monospace", marginTop: '6px' }}>
            {formatAmount(ex.amountCents, format)}
        </div>
    ) : scaffolding === 'invullen' ? (
        <div style={{ fontFamily: "'Azeret Mono', monospace", fontSize: '14px', marginTop: '6px' }}>
            {format === 'decimaal' ? '€ ___ , ___' : '€ _______'}
        </div>
    ) : (
        <div style={{ borderBottom: '1.5px solid #000', width: '100px', height: '20px', marginTop: '8px' }} />
    );

    const placeValueRow = showPlaceValues && !showSolutions ? (
        <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
            {placeValues.map(pv => (
                <div key={pv} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontFamily: "'Azeret Mono', monospace", fontWeight: 'bold', color: '#555' }}>{pv}</span>
                    <div style={{ borderBottom: '1.5px solid #000', width: '24px', height: '20px' }} />
                </div>
            ))}
        </div>
    ) : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', boxSizing: 'border-box', height: '100%' }}>
            {/* denomination area — flex-start so items stack from top; answer line stays at consistent position */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', alignContent: 'flex-start', width: '100%' }}>
                {ex.denominations.map((d, i) => <DenomItem key={i} denom={d} />)}
            </div>
            <div style={{ flex: 1 }} />
            {answerArea}
            {placeValueRow}
        </div>
    );
}

// ── Main viewer ───────────────────────────────────────────────────────────────

interface Props { block: MathBlock; showSolutions: boolean; }

export default function GeldViewer({ block, showSolutions }: Props) {
    const exercises: GeldExercise[] = block.geldExercises || [];
    const gap: number = block.verticalSpacing || 14;
    const allowedDenominations: number[] = block.constraints.allowedDenominations ?? [];
    const voorbeeldTypes: number[] = block.constraints.voorbeeldTypes ?? [];
    const showVoorbeelden: boolean = block.constraints.showVoorbeelden ?? false;
    const exercisesPerRow: number | null = block.constraints.exercisesPerRow ?? null;
    const perRow = exercisesPerRow ?? 4;

    if (exercises.length === 0) {
        return <div className="no-print" style={{ padding: '8px 0', fontStyle: 'italic', color: '#999', fontSize: '14px' }}>(Genereer oefeningen via het rechterpaneel)</div>;
    }

    return (
        <div>
            {showVoorbeelden && voorbeeldTypes.length > 0 && (
                <VoorbeeldenBar allowedDenominations={allowedDenominations} voorbeeldTypes={voorbeeldTypes} />
            )}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${perRow}, 1fr)`, gap: `${gap}px`, alignItems: 'stretch' }}>
                {exercises.map(ex => (
                    <HerkennenCell key={ex.id} ex={ex} block={block} showSolutions={showSolutions} />
                ))}
            </div>
        </div>
    );
}
