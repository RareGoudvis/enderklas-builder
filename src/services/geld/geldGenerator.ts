import type { MathBlock, GeldExercise, GeldDenomination, GeldDenominationType } from '../math/types';

// All denominations in cents, largest first
const DENOMINATION_CATALOGUE: { valueCents: number; type: GeldDenominationType }[] = [
    { valueCents: 50000, type: 'bill' },       // €500
    { valueCents: 20000, type: 'bill' },       // €200
    { valueCents: 10000, type: 'bill' },       // €100
    { valueCents:  5000, type: 'bill' },       // €50
    { valueCents:  2000, type: 'bill' },       // €20
    { valueCents:  1000, type: 'bill' },       // €10
    { valueCents:   500, type: 'bill' },       // €5
    { valueCents:   200, type: 'euro-coin' },  // €2
    { valueCents:   100, type: 'euro-coin' },  // €1
    { valueCents:    50, type: 'cent-coin' },  // 50c
    { valueCents:    20, type: 'cent-coin' },  // 20c
    { valueCents:    10, type: 'cent-coin' },  // 10c
    { valueCents:     5, type: 'cent-coin' },  // 5c
];

const MAX_ITEMS_PER_EXERCISE = 12;

function breakdownAmount(
    amountCents: number,
    allowedValues: Set<number>,
    rng: () => number,
): GeldDenomination[] {
    const allowed = DENOMINATION_CATALOGUE.filter(d => allowedValues.has(d.valueCents));
    const result: GeldDenomination[] = [];
    let remaining = amountCents;
    let totalItems = 0;

    for (const denom of allowed) {
        if (remaining <= 0 || totalItems >= MAX_ITEMS_PER_EXERCISE) break;
        // Add randomness: 20% chance to skip largest if something smaller still fits
        const nextDenom = allowed[allowed.indexOf(denom) + 1];
        if (nextDenom && remaining >= nextDenom.valueCents && rng() < 0.2) continue;

        const maxCount = Math.min(
            Math.floor(remaining / denom.valueCents),
            MAX_ITEMS_PER_EXERCISE - totalItems,
        );
        if (maxCount <= 0) continue;
        result.push({ valueCents: denom.valueCents, type: denom.type, count: maxCount });
        remaining -= denom.valueCents * maxCount;
        totalItems += maxCount;
    }

    // If remaining > 0, we couldn't break it down perfectly — just ignore remainder
    return result;
}

function seededRng(seed: number) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

export function generateGeldExercises(block: MathBlock): GeldExercise[] {
    const {
        maxGetal = 10,
        format = 'euros',
        allowedDenominations = DENOMINATION_CATALOGUE.map(d => d.valueCents),
    } = block.constraints;

    const n = block.numberOfExercises || 6;
    const maxCents = maxGetal * 100;
    const allowedSet = new Set<number>(allowedDenominations as number[]);
    const isTekenen = block.typeId === 'geld-tekenen';

    // Smallest allowed denomination determines minimum amount
    const allowedSorted = [...allowedSet].filter(v => v <= maxCents).sort((a, b) => a - b);
    const minCents = allowedSorted[0] ?? 5;

    const exercises: GeldExercise[] = [];
    const rng = seededRng(Date.now() & 0xffff);

    for (let i = 0; i < n; i++) {
        // Pick random amount, rounded to nearest allowed min denomination
        const raw = Math.floor(rng() * (maxCents - minCents + 1)) + minCents;
        const amountCents = Math.round(raw / minCents) * minCents;

        // For 'euros' format: round to nearest 100 (whole euros) if no cents denominations allowed
        const hasCents = allowedSorted.some(v => v < 100);
        const finalAmount = (format === 'euros' && !hasCents)
            ? Math.max(100, Math.round(amountCents / 100) * 100)
            : amountCents;

        const denominations: GeldDenomination[] = isTekenen
            ? []  // Tekenen: student draws, we don't generate denominations
            : breakdownAmount(finalAmount, allowedSet, rng);

        exercises.push({
            id: `geld-${Date.now()}-${i}-${Math.floor(rng() * 9999)}`,
            amountCents: finalAmount,
            denominations,
            isManuallyEdited: false,
        });
    }

    return exercises;
}

export function formatAmount(amountCents: number, format: string): string {
    if (format === 'euros') {
        return `€${Math.round(amountCents / 100)}`;
    }
    const euros = Math.floor(amountCents / 100);
    const cents = amountCents % 100;
    return `€${euros},${String(cents).padStart(2, '0')}`;
}

export function denominationLabel(valueCents: number): string {
    if (valueCents >= 100) return `€${valueCents / 100}`;
    return `${valueCents}c`;
}

export { DENOMINATION_CATALOGUE };
