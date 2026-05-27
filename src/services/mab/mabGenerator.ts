import type { MathBlock, MabExercise } from '../math/types';

// 'MAB' = Multibase Arithmetic Blocks (Dienes blocks). Exercise asks pupil
// to read a quantity drawn as place-value blocks and write the matching number.

const MAX_ATTEMPTS = 5000;

const randInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

function decompose(n: number): { thousands: number; hundreds: number; tens: number; units: number } {
    return {
        thousands: Math.floor(n / 1000),
        hundreds: Math.floor(n / 100) % 10,
        tens: Math.floor(n / 10) % 10,
        units: n % 10,
    };
}

// User can require specific place-values to be non-zero via operand1Mask.
// E.g. mask = { H:true, E:true } forces hundreds≥1 and units≥1; tens free.
function maskMatches(n: number, mask: Record<string, boolean>, maxNumber: number): boolean {
    const { thousands, hundreds, tens, units } = decompose(n);
    if (mask.D && maxNumber >= 1000 && thousands < 1) return false;
    if (mask.H && hundreds < 1) return false;
    if (mask.T && tens < 1) return false;
    if (mask.E && units < 1) return false;
    return true;
}

function hasInternalZero(n: number, maxNumber: number): boolean {
    const { thousands, hundreds, tens, units } = decompose(n);
    if (maxNumber >= 1000 && thousands >= 1) {
        if (hundreds === 0 || tens === 0) return true;
        if (units === 0 && (hundreds > 0 || tens > 0)) return true;
    } else if (hundreds >= 1) {
        if (tens === 0 && units !== 0) return true;
    }
    return false;
}

export function generateMabExercises(block: MathBlock): MabExercise[] {
    const {
        maxNumber = 100,
        operand1Mask = {},
        specifiekeGetallen = [],
        useSpecifiek = false,
        allowInternalZero = true,
    } = block.constraints;

    const n = block.numberOfExercises;
    const results: MabExercise[] = [];

    // Manual list path: iterate provided numbers, clamp to range, dedupe.
    if (useSpecifiek && Array.isArray(specifiekeGetallen) && specifiekeGetallen.length > 0) {
        const seen = new Set<number>();
        for (const raw of specifiekeGetallen) {
            const v = Math.max(1, Math.min(Math.floor(Number(raw)), maxNumber));
            if (Number.isFinite(v) && !seen.has(v)) {
                seen.add(v);
                results.push({ id: Math.random().toString(36).substring(2, 9), value: v, ...decompose(v), isManuallyEdited: false });
            }
            if (results.length >= n) break;
        }
        return results;
    }

    // Random path with mask + uniqueness retry loop.
    const used = new Set<number>();
    let attempts = 0;
    while (results.length < n && attempts < MAX_ATTEMPTS) {
        attempts++;
        const v = randInt(1, maxNumber);
        if (used.has(v)) continue;
        if (!maskMatches(v, operand1Mask, maxNumber)) continue;
        if (!allowInternalZero && hasInternalZero(v, maxNumber)) continue;
        used.add(v);
        results.push({ id: Math.random().toString(36).substring(2, 9), value: v, ...decompose(v), isManuallyEdited: false });
    }

    return results;
}
