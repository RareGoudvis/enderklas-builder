import type { MathBlock, SplitsenExercise } from '../math/types';
import { PLACE_VALUES } from '../math/mathEngine';

const randInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

function generateTotal(maxGetal: number, mask: Record<string, boolean>, fixedTotal: number | null): number {
    if (fixedTotal && fixedTotal >= 2 && fixedTotal <= maxGetal) return fixedTotal;

    const hasMask = Object.values(mask).some(Boolean);
    if (!hasMask) return randInt(2, maxGetal);

    let total = 0;
    for (const place of PLACE_VALUES) {
        if (mask[place.key] && place.weight >= 1) {
            const maxForPlace = Math.floor(maxGetal / place.weight);
            if (maxForPlace >= 1) {
                total += randInt(1, Math.min(9, maxForPlace)) * place.weight;
            }
        }
    }
    return Math.max(2, Math.min(total, maxGetal));
}

function generateGiven(total: number, mask: Record<string, boolean>): number {
    const hasMask = Object.values(mask).some(Boolean);
    if (!hasMask) return randInt(0, total);

    let given = 0;
    for (const place of PLACE_VALUES) {
        if (mask[place.key] && place.weight >= 1) {
            const maxForPlace = Math.floor(total / place.weight);
            if (maxForPlace >= 1) {
                given += randInt(1, Math.min(9, maxForPlace)) * place.weight;
            }
        }
    }
    return Math.max(0, Math.min(given, total));
}

export function generateSplitsenExercises(block: MathBlock): SplitsenExercise[] {
    const {
        maxGetal = 10,
        operand1Mask = {},
        operand2Mask = {},
        fixedTotal = null,
        layout = 'basic',
        rowsPerBox = 4,
    } = block.constraints;

    const n = block.numberOfExercises;
    const pairsPerItem = layout === 'basic' ? (rowsPerBox || 4) : 1;
    const results: SplitsenExercise[] = [];

    for (let i = 0; i < n; i++) {
        const total = generateTotal(maxGetal, operand1Mask, fixedTotal);

        const usedGivens = new Set<number>();
        const pairs: Array<{ given: number; answer: number }> = [];

        for (let j = 0; j < pairsPerItem; j++) {
            let given: number;
            let attempts = 0;
            do {
                given = generateGiven(total, operand2Mask);
                attempts++;
            } while (usedGivens.has(given) && attempts < 100);

            usedGivens.add(given);
            pairs.push({ given, answer: total - given });
        }

        results.push({
            id: Math.random().toString(36).substring(2, 9),
            total,
            pairs,
            isManuallyEdited: false,
        });
    }

    return results;
}
