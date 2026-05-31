import type { MathBlock, AfrondenExercise } from '../math/types';
import { getMaskPlaces } from '../math/mathEngine';

// Natural-number rounding targets (units are excluded — rounding to E is a no-op).
export const ROUND_TARGETS = [
    { key: 'T',  label: 'tiental',        weight: 10 },
    { key: 'H',  label: 'honderdtal',     weight: 100 },
    { key: 'D',  label: 'duizendtal',     weight: 1000 },
    { key: 'TD', label: 'tienduizendtal', weight: 10000 },
];

export function roundTo(n: number, weight: number): number {
    return Math.round(n / weight) * weight;
}

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildNumber(maxGetal: number, numberMask: Record<string, boolean>): number {
    const active = getMaskPlaces(maxGetal, 'natural').filter(p => numberMask[p.key]);
    if (!active.length) return randInt(1, maxGetal);
    let n = 0;
    for (const p of active) n += randInt(1, 9) * p.weight;
    return n > maxGetal ? randInt(1, maxGetal) : n;
}

export function generateAfrondenExercises(block: MathBlock): AfrondenExercise[] {
    const subType: string = block.constraints.subType ?? 'rooster';
    const maxGetal: number = block.constraints.maxGetal ?? 1000;
    const numberMask: Record<string, boolean> = block.constraints.numberMask ?? {};
    const targets: string[] = block.constraints.roundTargets ?? ['T', 'H'];
    // Only targets that make sense for this range (weight strictly below maxGetal).
    const usable = ROUND_TARGETS.filter(t => targets.includes(t.key) && t.weight < maxGetal).map(t => t.key);
    const pool = usable.length ? usable : ['T'];
    const count = block.numberOfExercises || 6;

    const out: AfrondenExercise[] = [];
    const seen = new Set<string>();
    let attempts = 0;
    while (out.length < count && attempts < 20000) {
        attempts++;
        const number = buildNumber(maxGetal, numberMask);
        if (subType === 'simpel') {
            const targetKey = pool[randInt(0, pool.length - 1)];
            const key = `${number}-${targetKey}`;
            if (seen.has(key)) continue;
            seen.add(key);
            out.push({ id: Math.random().toString(36).substring(2, 9), number, targetKey, isManuallyEdited: false });
        } else {
            if (seen.has(String(number))) continue;
            seen.add(String(number));
            out.push({ id: Math.random().toString(36).substring(2, 9), number, isManuallyEdited: false });
        }
    }
    return out;
}
