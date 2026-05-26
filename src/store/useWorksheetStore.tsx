import { create } from 'zustand';
import type { MathBlock, Equation, ClockExercise, FractionExercise, SplitsenExercise, CijferExercise, GeldExercise, GeldWisselExercise, GeldTeruggevenExercise, FooterData, LayoutPreset } from '../services/math/types';

interface HeaderData {
    naam: boolean;
    klas: boolean;
    nummer: boolean;
    datum: boolean;
    titel:string;
}

export interface DocSettings {
    showScores: boolean;
    opdrachtTitelStyle: 'regular' | 'boxed' | 'underlined';
    showDividers: boolean;
    headerStyle: 'geen' | 'kader';
    titlePosition: 'left' | 'center' | 'right';
    titleFieldsGap: number;
    headerContentGap: number;
}

interface WorksheetState {
    blocks: MathBlock[];
    activeBlockId: string | 'document' | null;
    header: HeaderData;
    footer: FooterData;
    docSettings: DocSettings;
    showSolutions: boolean;
    _history: MathBlock[][];
    _historyIndex: number;
    addBlockFromType: (typeId: string, label: string, overrideConstraints?: Record<string, unknown>) => void;
    removeBlock: (id: string) => void;
    moveBlockUp: (id: string) => void;
    moveBlockDown: (id: string) => void;
    updateBlockInstruction: (id: string, text: string) => void;
    updateBlockLayout: (id: string, layout: LayoutPreset, steppedLines?: number) => void;
    updateBlockSettings: (id: string, updates: Partial<MathBlock>) => void;
    setBlockExercises: (id: string, exercises: Equation[]) => void;
    setClockExercises: (id: string, exercises: ClockExercise[]) => void;
    setFractionExercises: (id: string, exercises: FractionExercise[]) => void;
    setSplitsenExercises: (id: string, exercises: SplitsenExercise[]) => void;
    setCijferExercises: (id: string, exercises: CijferExercise[]) => void;
    setGeldExercises: (id: string, exercises: GeldExercise[]) => void;
    setGeldWisselExercises: (id: string, exercises: GeldWisselExercise[]) => void;
    setGeldTeruggevenExercises: (id: string, exercises: GeldTeruggevenExercise[]) => void;
    updateExercise: (blockId: string, exerciseId: string, updates: Partial<Equation>) => void;
    updateCijferExercise: (blockId: string, exerciseId: string, updates: Partial<CijferExercise>) => void;
    setActiveSelection: (id: string | 'document' | null) => void;
    updateHeader: (updates: Partial<HeaderData>) => void;
    updateFooter: (updates: Partial<FooterData>) => void;
    updateDocSettings: (updates: Partial<DocSettings>) => void;
    setShowSolutions: (show: boolean) => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

const MAX_HISTORY = 50;

function pushHistory(history: MathBlock[][], index: number, blocks: MathBlock[]): { _history: MathBlock[][], _historyIndex: number } {
    const sliced = history.slice(0, index + 1);
    const next = [...sliced, blocks].slice(-MAX_HISTORY);
    return { _history: next, _historyIndex: next.length - 1 };
}

export const useWorksheetStore = create<WorksheetState>((set, get) => ({
    blocks: [],
    activeBlockId: null,
    header: { naam: true, klas: true, nummer: false, datum: false, titel: '' },
    footer: { school: '', klas: '', leerkracht: '', showSchool: true, showKlas: true, showLeerkracht: true, showPagina: true, centerText: '', showCenterText: false },
    docSettings: { showScores: true, opdrachtTitelStyle: 'regular', showDividers: true, headerStyle: 'geen', titlePosition: 'center', titleFieldsGap: 16, headerContentGap: 12 },
    showSolutions: false,
    _history: [[]],
    _historyIndex: 0,

    undo: () => set((state) => {
        const idx = state._historyIndex - 1;
        if (idx < 0) return state;
        return { blocks: state._history[idx], _historyIndex: idx };
    }),
    redo: () => set((state) => {
        const idx = state._historyIndex + 1;
        if (idx >= state._history.length) return state;
        return { blocks: state._history[idx], _historyIndex: idx };
    }),
    canUndo: () => get()._historyIndex > 0,
    canRedo: () => get()._historyIndex < get()._history.length - 1,

    setFractionExercises: (id: string, exercises: FractionExercise[]) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, fractionExercises: exercises } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    setSplitsenExercises: (id: string, exercises: SplitsenExercise[]) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, splitsenExercises: exercises } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    setCijferExercises: (id: string, exercises: CijferExercise[]) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, cijferExercises: exercises } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    setGeldExercises: (id: string, exercises: GeldExercise[]) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, geldExercises: exercises } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    setGeldWisselExercises: (id: string, exercises: GeldWisselExercise[]) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, geldWisselExercises: exercises } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    setGeldTeruggevenExercises: (id: string, exercises: GeldTeruggevenExercise[]) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, geldTeruggevenExercises: exercises } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),

    addBlockFromType: (typeId, label, overrideConstraints) => set((state) => {
        const isClockBlock = typeId.startsWith('klok-');
        const isFractionBlock = typeId === 'breuken';
        const isSplitsenBlock = typeId === 'splitsen';
        const isCijferBlock = typeId.startsWith('cijferen-');
        const isGeldBlock = typeId === 'geld-herkennen' || typeId === 'geld-tekenen';
        const isGeldWissel = typeId === 'geld-wissel';
        const isGeldTeruggeven = typeId === 'geld-teruggeven';
        const defaultConstraints = isGeldBlock ? {
            maxGetal: 10,
            format: 'euros',
            scaffolding: typeId === 'geld-tekenen' ? 'eenvoudig' : 'invullen',
            showPlaceValues: false,
            placeValues: ['T', 'E'],
            showVoorbeelden: false,
            voorbeeldTypes: [] as number[],
            exercisesPerRow: null as number | null,
            allowedDenominations: [50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5],
            boxHeight: 80,
        } : isGeldWissel ? {
            exerciseBills: [500, 1000],
            exercisesPerRow: 2,
            boxHeight: 100,
        } : isGeldTeruggeven ? {
            minPriceEuros: 1,
            maxPriceEuros: 49,
            payWithOptions: [1000, 2000, 5000],
            centenDeel: 'vijf',
            scaffolding: 'ingevuld',
            antwoordType: 'schrijven',
            antwoordFormat: 'euro-cent',
            betalenMetTekening: false,
            boxHeight: 120,
        } : isCijferBlock ? {
            operator: '+',
            numberType: 'natural',
            maxRange: 1000,
            decimalPlaces: 2,
            withEstimation: false,
            scaffolding: 3,
            withRemainder: false,
            numberOfTerms: 2,
            gridCellSize: 25,
            operand0Mask: {},
            operand1Mask: {},
            operand2Mask: {},
            operand3Mask: {},
            bridges: {},
            extraCols: 0,
            extraRows: 0,
        } : isSplitsenBlock ? {
            maxGetal: 10,
            operand1Mask: {},
            operand2Mask: {},
            fixedTotal: null,
            layout: 'basic',
            rowsPerBox: 4,
            rowHeight: 28,
        } : isFractionBlock ? {
            subType: 'kleuren',
            shape: 'rectangle',
            minDenominator: 2,
            maxDenominator: 8,
            answerFormat: 'fraction-questions',
            objectShape: 'circle',
            maxTotal: 20,
            minLineLength: 4,
            maxLineLength: 12,
            level: 1,
            answerMode: 'berekeningslijnen',
            maxDimension: 6,
            maxAbstractN3: 1000,
        } : isClockBlock ? {
            clockType: 'analoog',
            exerciseMode: 'lezen',
            is24hour: false,
            timeTypes: ['uren', 'halve_uren', 'kwartier_over', 'kwartier_voor'],
            minuteDirection: 'beide',
            handChoice: 'beide',
        } : {
            numberType: 'natural', decimalPlaces: 2, maxGetal: 1000,
            bridges: { E: 'FREE', T: 'FREE' },
            operand1Mask: {}, operand2Mask: {},
            fractionDifficulty: 'same',
            mixedNumber1: false,
            mixedNumber2: false,
            maxNumerator1: 10,
            maxDenominator1: 10,
            maxNumerator2: 10,
            maxDenominator2: 10,
            linkFractions: true,
            multiplicationMode: 'tafels',
            selectedTables: [2, 3, 4, 5, 10],
            tableLimit: 10
        };

        const newBlock: MathBlock = {
            id: Math.random().toString(36).substring(2, 9),
            typeId,
            instructionText: `${label}:`,
            instructionMode: 'geen',
            layoutPreset: 'inline-short',
            steppedLines: 3,
            numberOfExercises: isFractionBlock ? 6 : isSplitsenBlock ? 5 : isCijferBlock ? 2 : isGeldBlock ? 6 : (isGeldWissel || isGeldTeruggeven) ? 4 : 10,
            totalPoints: 5,
            verticalSpacing: 14,
            constraints: { ...defaultConstraints, ...overrideConstraints },
            exercises: []
        };

        const newBlocks = [...state.blocks, newBlock];
        return { blocks: newBlocks, activeBlockId: newBlock.id, ...pushHistory(state._history, state._historyIndex, newBlocks) };
    }),

    removeBlock: (id) => set((state) => {
        const newBlocks = state.blocks.filter(b => b.id !== id);
        return { blocks: newBlocks, activeBlockId: state.activeBlockId === id ? null : state.activeBlockId, ...pushHistory(state._history, state._historyIndex, newBlocks) };
    }),

    moveBlockUp: (id) => set((state) => {
        const index = state.blocks.findIndex(b => b.id === id);
        if (index <= 0) return state;
        const newBlocks = [...state.blocks];
        [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
        return { blocks: newBlocks, ...pushHistory(state._history, state._historyIndex, newBlocks) };
    }),

    moveBlockDown: (id) => set((state) => {
        const index = state.blocks.findIndex(b => b.id === id);
        if (index === -1 || index === state.blocks.length - 1) return state;
        const newBlocks = [...state.blocks];
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        return { blocks: newBlocks, ...pushHistory(state._history, state._historyIndex, newBlocks) };
    }),

    updateBlockInstruction: (id, text) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, instructionText: text } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    updateBlockLayout: (id, layout, steppedLines) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, layoutPreset: layout, steppedLines: steppedLines ?? b.steppedLines } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    updateBlockSettings: (id, updates) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, ...updates } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    setBlockExercises: (id, exercises) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, exercises } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    setClockExercises: (id, exercises) => set((state) => { const nb = state.blocks.map(b => b.id === id ? { ...b, clockExercises: exercises } : b); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    updateExercise: (blockId, exerciseId, updates) => set((state) => { const nb = state.blocks.map(b => b.id !== blockId ? b : { ...b, exercises: b.exercises.map(ex => ex.id === exerciseId ? { ...ex, ...updates } : ex) }); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    updateCijferExercise: (blockId, exerciseId, updates) => set((state) => { const nb = state.blocks.map(b => b.id !== blockId ? b : { ...b, cijferExercises: (b.cijferExercises || []).map(ex => ex.id === exerciseId ? { ...ex, ...updates } : ex) }); return { blocks: nb, ...pushHistory(state._history, state._historyIndex, nb) }; }),
    setActiveSelection: (id) => set({ activeBlockId: id }),
    updateHeader: (updates) => set((state) => ({ header: { ...state.header, ...updates } })),
    updateFooter: (updates) => set((state) => ({ footer: { ...state.footer, ...updates } })),
    updateDocSettings: (updates) => set((state) => ({ docSettings: { ...state.docSettings, ...updates } })),
    setShowSolutions: (show) => set({ showSolutions: show })
}));