import { create } from 'zustand';
import type { MathBlock, Equation, ClockExercise, FractionExercise, FooterData, LayoutPreset } from '../services/math/types';

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
    titlePosition: 'center' | 'right';
}

interface WorksheetState {
    blocks: MathBlock[];
    activeBlockId: string | 'document' | null;
    header: HeaderData;
    footer: FooterData;
    docSettings: DocSettings;
    showSolutions: boolean;
    addBlockFromType: (typeId: string, label: string) => void;
    removeBlock: (id: string) => void;
    moveBlockUp: (id: string) => void;
    moveBlockDown: (id: string) => void;
    updateBlockInstruction: (id: string, text: string) => void;
    updateBlockLayout: (id: string, layout: LayoutPreset, steppedLines?: number) => void;
    updateBlockSettings: (id: string, updates: Partial<MathBlock>) => void;
    setBlockExercises: (id: string, exercises: Equation[]) => void;
    setClockExercises: (id: string, exercises: ClockExercise[]) => void;
    setFractionExercises: (id: string, exercises: FractionExercise[]) => void;
    updateExercise: (blockId: string, exerciseId: string, updates: Partial<Equation>) => void;
    setActiveSelection: (id: string | 'document' | null) => void;
    updateHeader: (updates: Partial<HeaderData>) => void;
    updateFooter: (updates: Partial<FooterData>) => void;
    updateDocSettings: (updates: Partial<DocSettings>) => void;
    setShowSolutions: (show: boolean) => void;
}

export const useWorksheetStore = create<WorksheetState>((set) => ({
    blocks: [],
    activeBlockId: null,
    header: { naam: true, klas: true, nummer: false, datum: false, titel: '' },
    footer: { school: '', klas: '', leerkracht: '', showSchool: true, showKlas: true, showLeerkracht: true, showPagina: true },
    docSettings: { showScores: true, opdrachtTitelStyle: 'regular', showDividers: true, headerStyle: 'geen', titlePosition: 'center' },
    showSolutions: false,

    setFractionExercises: (id: string, exercises: FractionExercise[]) => set((state) => ({ blocks: state.blocks.map(b => b.id === id ? { ...b, fractionExercises: exercises } : b) })),

    addBlockFromType: (typeId, label) => set((state) => {
        const isClockBlock = typeId.startsWith('klok-');
        const isFractionBlock = typeId === 'breuken';
        const defaultConstraints = isFractionBlock ? {
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
            numberOfExercises: isFractionBlock ? 6 : 10,
            totalPoints: 5,
            verticalSpacing: 14,
            constraints: defaultConstraints,
            exercises: []
        };

        return { blocks: [...state.blocks, newBlock], activeBlockId: newBlock.id };
    }),

    removeBlock: (id) => set((state) => ({ blocks: state.blocks.filter(b => b.id !== id), activeBlockId: state.activeBlockId === id ? null : state.activeBlockId })),

    // Sorteren
    moveBlockUp: (id) => set((state) => {
        const index = state.blocks.findIndex(b => b.id === id);
        if (index <= 0) return state; // Kan niet hoger
        const newBlocks = [...state.blocks];
        [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]]; // Verwissel
        return { blocks: newBlocks };
    }),

    moveBlockDown: (id) => set((state) => {
        const index = state.blocks.findIndex(b => b.id === id);
        if (index === -1 || index === state.blocks.length - 1) return state; // Kan niet lager
        const newBlocks = [...state.blocks];
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]]; // Verwissel
        return { blocks: newBlocks };
    }),

    updateBlockInstruction: (id, text) => set((state) => ({ blocks: state.blocks.map(b => b.id === id ? { ...b, instructionText: text } : b) })),
    updateBlockLayout: (id, layout, steppedLines) => set((state) => ({ blocks: state.blocks.map(b => b.id === id ? { ...b, layoutPreset: layout, steppedLines: steppedLines ?? b.steppedLines } : b) })),
    updateBlockSettings: (id, updates) => set((state) => ({ blocks: state.blocks.map(b => b.id === id ? { ...b, ...updates } : b) })),
    setBlockExercises: (id, exercises) => set((state) => ({ blocks: state.blocks.map(b => b.id === id ? { ...b, exercises } : b) })),
    setClockExercises: (id, exercises) => set((state) => ({ blocks: state.blocks.map(b => b.id === id ? { ...b, clockExercises: exercises } : b) })),
    updateExercise: (blockId, exerciseId, updates) => set((state) => ({ blocks: state.blocks.map(b => b.id !== blockId ? b : { ...b, exercises: b.exercises.map(ex => ex.id === exerciseId ? { ...ex, ...updates } : ex) }) })),
    setActiveSelection: (id) => set({ activeBlockId: id }),
    updateHeader: (updates) => set((state) => ({ header: { ...state.header, ...updates } })),
    updateFooter: (updates) => set((state) => ({ footer: { ...state.footer, ...updates } })),
    updateDocSettings: (updates) => set((state) => ({ docSettings: { ...state.docSettings, ...updates } })),
    setShowSolutions: (show) => set({ showSolutions: show })
}));