import type { FractionExercise, FractionSubType, FractionShape, MathBlock } from '../math/types';

function getGridLayout(denominator: number): { rows: number; cols: number } {
    const layouts: Record<number, [number, number]> = {
        2: [1, 2], 3: [1, 3], 4: [2, 2], 5: [1, 5],
        6: [2, 3], 7: [1, 7], 8: [2, 4], 9: [3, 3],
        10: [2, 5], 12: [3, 4],
    };
    const entry = layouts[denominator];
    return entry ? { rows: entry[0], cols: entry[1] } : { rows: 1, cols: denominator };
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeShapeExercise(subType: FractionSubType, block: MathBlock): FractionExercise {
    const { shape = 'square', minDenominator = 2, maxDenominator = 8 } = block.constraints;
    const valid = [2, 3, 4, 5, 6, 8, 9, 10, 12].filter(d => d >= minDenominator && d <= maxDenominator);
    const denominator = valid.length ? valid[randInt(0, valid.length - 1)] : 4;
    const numerator = randInt(1, denominator - 1);
    const { rows, cols } = getGridLayout(denominator);
    const coloredIndices = shuffle(Array.from({ length: denominator }, (_, i) => i))
        .slice(0, numerator).sort((a, b) => a - b);
    return {
        id: Math.random().toString(36).substring(2, 9),
        subType,
        numerator, denominator,
        shape: shape as FractionShape,
        coloredIndices, gridRows: rows, gridCols: cols,
        isManuallyEdited: false,
    };
}

function makeAmountExercise(subType: FractionSubType, block: MathBlock): FractionExercise {
    const { objectShape = 'circle', maxTotal = 20, minDenominator = 2, maxDenominator = 5 } = block.constraints;
    const denominator = randInt(minDenominator, maxDenominator);
    const numerator = randInt(1, denominator - 1);
    const maxMult = Math.floor(maxTotal / denominator);
    const multiplier = Math.max(2, randInt(2, maxMult));
    return {
        id: Math.random().toString(36).substring(2, 9),
        subType,
        numerator, denominator,
        total: denominator * multiplier,
        objectShape: objectShape as 'circle' | 'square',
        isManuallyEdited: false,
    };
}

function makeLijnstukExercise(block: MathBlock): FractionExercise {
    const { minDenominator = 2, maxDenominator = 6, maxLineLength = 15 } = block.constraints;
    const denominator = randInt(minDenominator, maxDenominator);
    const numerator = randInt(1, denominator - 1);
    const maxMult = Math.floor(maxLineLength / denominator);
    const multiplier = Math.max(1, randInt(1, Math.max(1, maxMult)));
    return {
        id: Math.random().toString(36).substring(2, 9),
        subType: 'lijnstuk',
        numerator, denominator,
        lineLength: denominator * multiplier,
        isManuallyEdited: false,
    };
}

export function generateFractionExercises(block: MathBlock): FractionExercise[] {
    const subType = (block.constraints.subType || 'kleuren') as FractionSubType;
    const count = block.numberOfExercises || 6;

    return Array.from({ length: count }, () => {
        switch (subType) {
            case 'kleuren':
            case 'herkennen':
            case 'tekenen':
                return makeShapeExercise(subType, block);
            case 'hoeveelheid':
            case 'hoeveelheid-rechthoek':
                return makeAmountExercise(subType, block);
            case 'lijnstuk':
                return makeLijnstukExercise(block);
        }
    });
}
