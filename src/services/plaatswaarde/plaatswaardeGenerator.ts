import type { MathBlock, PlaatswaardeExercise } from '../math/types';
import { getMaskPlaces } from '../math/mathEngine';

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Build a number respecting the optional place-value mask (specifieke getalopbouw).
// Empty mask → free number in [1, maxGetal]. Each masked place gets a 1–9 digit.
function buildNumber(maxGetal: number, numberMask: Record<string, boolean>): number {
    const places = getMaskPlaces(maxGetal, 'natural');   // integer weights ≥1, ≤ maxGetal
    const active = places.filter(p => numberMask[p.key]);
    if (!active.length) return randInt(1, maxGetal);
    let n = 0;
    for (const p of active) n += randInt(1, 9) * p.weight;
    return n > maxGetal ? randInt(1, maxGetal) : n;
}

export function generatePlaatswaardeExercises(block: MathBlock): PlaatswaardeExercise[] {
    const subType: string = block.constraints.subType ?? 'waarde';
    const maxGetal: number = block.constraints.maxGetal ?? 1000;
    const numberMask: Record<string, boolean> = block.constraints.numberMask ?? {};
    const count = block.numberOfExercises || 6;
    const places = getMaskPlaces(maxGetal, 'natural');   // descending (D H T E …)

    const out: PlaatswaardeExercise[] = [];
    const seen = new Set<string>();
    let attempts = 0;
    while (out.length < count && attempts < 20000) {
        attempts++;
        const number = buildNumber(maxGetal, numberMask);
        // Places whose digit is non-zero — candidates to underline / ask about.
        const present = places.filter(p => Math.floor(number / p.weight) % 10 !== 0);
        if (!present.length) continue;
        const chosen = present[randInt(0, present.length - 1)];
        // tabel asks for the whole number; waarde/plaats single out one digit.
        const key = subType === 'tabel' ? `t${number}` : `${number}-${chosen.key}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ id: Math.random().toString(36).substring(2, 9), number, placeKey: chosen.key, isManuallyEdited: false });
    }
    return out;
}
