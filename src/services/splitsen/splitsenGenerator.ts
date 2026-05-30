import type { MathBlock, SplitsenExercise } from '../math/types';
import { PLACE_VALUES } from '../math/mathEngine';
import { numberToDutchWords } from './dutchWords';

const randInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const rndId = () => Math.random().toString(36).substring(2, 9);

// Integer place values, high→low, up to one billion (PLACE_VALUES only reaches M).
const INT_PLACES = [
    { key: 'Mrd', label: 'Miljardtallen', weight: 1_000_000_000 },
    { key: 'HM', label: 'Honderdmiljoentallen', weight: 100_000_000 },
    { key: 'TM', label: 'Tienmiljoentallen', weight: 10_000_000 },
    { key: 'M', label: 'Miljoentallen', weight: 1_000_000 },
    { key: 'HD', label: 'Honderdduizendtallen', weight: 100_000 },
    { key: 'TD', label: 'Tienduizendtallen', weight: 10_000 },
    { key: 'D', label: 'Duizendtallen', weight: 1_000 },
    { key: 'H', label: 'Honderdtallen', weight: 100 },
    { key: 'T', label: 'Tientallen', weight: 10 },
    { key: 'E', label: 'Eenheden', weight: 1 },
];

type Place = { key: string; label: string; digit: number; weight: number };

// All columns whose weight ≤ maxGetal (down to E), each carrying this number's digit.
function fullColumns(num: number, maxGetal: number): Place[] {
    return INT_PLACES.filter(p => p.weight <= Math.max(1, maxGetal))
        .map(p => ({ ...p, digit: Math.floor(num / p.weight) % 10 }));
}

// Only the non-zero places of a number (high→low), for legs / equation forms.
function nonZeroPlaces(num: number): Place[] {
    return INT_PLACES.map(p => ({ ...p, digit: Math.floor(num / p.weight) % 10 })).filter(p => p.digit !== 0);
}

// Splitsbenen variant = a (blankSide, notation) combo, e.g. 'legs-letters'.
type BenenCombo = { blankSide: 'legs' | 'top'; notation: 'value' | 'letters' };
function parseBenenCombos(c: Record<string, unknown>): BenenCombo[] {
    const list = Array.isArray(c.benenVariants) ? (c.benenVariants as string[]) : [];
    const combos = list.map(s => {
        const [side, notation] = s.split('-');
        return { blankSide: side === 'top' ? 'top' : 'legs', notation: notation === 'value' ? 'value' : 'letters' } as BenenCombo;
    });
    if (combos.length) return combos;
    // Back-compat: single combo from the old blankSide + notation keys.
    return [{ blankSide: (c.blankSide === 'top' ? 'top' : 'legs'), notation: (c.notation === 'value' ? 'value' : 'letters') }];
}

function generatePlaceValueExercises(block: MathBlock): SplitsenExercise[] {
    const {
        layout,
        maxGetal = 1000,
        mathDirection = 'decompose',
    } = block.constraints;
    const benenCombos = parseBenenCombos(block.constraints);
    // Included plaatswaarden notations (letters/expanded); fall back to single mathForm.
    const mathFormList: string[] = Array.isArray(block.constraints.mathForms) && block.constraints.mathForms.length
        ? block.constraints.mathForms
        : [block.constraints.mathForm === 'expanded' ? 'expanded' : 'letters'];
    const n = block.numberOfExercises;
    const results: SplitsenExercise[] = [];
    const used = new Set<number>();

    for (let i = 0; i < n; i++) {
        const cap = layout === 'positie-tabel' ? Math.min(maxGetal, 1_000_000) : maxGetal;
        let num = randInt(Math.min(11, cap), cap);
        let attempts = 0;
        while (used.has(num) && attempts < 200) { num = randInt(Math.min(11, cap), cap); attempts++; }
        used.add(num);

        const base: SplitsenExercise = { id: rndId(), total: num, pairs: [], isManuallyEdited: false };

        if (layout === 'positie-tabel') {
            results.push({ ...base, placeBreakdown: fullColumns(num, maxGetal), words: numberToDutchWords(num) });
        } else if (layout === 'positie-benen') {
            // Mix among the teacher's included (blankSide, notation) combos.
            const combo = benenCombos[randInt(0, benenCombos.length - 1)];
            results.push({ ...base, placeBreakdown: nonZeroPlaces(num), blankSide: combo.blankSide, notation: combo.notation });
        } else {
            // positie-math: mix the included notations (letters/expanded) + direction.
            const form = mathFormList[randInt(0, mathFormList.length - 1)] === 'expanded' ? 'expanded' : 'letters';
            const dir = mathDirection === 'beide' ? (Math.random() < 0.5 ? 'decompose' : 'compose') : mathDirection;
            results.push({ ...base, placeBreakdown: nonZeroPlaces(num), mathForm: form, mathDirection: dir });
        }
    }
    return results;
}

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

    // Place-value variants share this generator but a different shape.
    if (layout === 'positie-tabel' || layout === 'positie-benen' || layout === 'positie-math') {
        return generatePlaceValueExercises(block);
    }

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
