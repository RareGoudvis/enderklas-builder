import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { MathBlock, Fraction, Equation } from '../../services/math/types';

// Import real WOFF font files from @fontsource — these are valid binary fonts,
// unlike the HTML files that were previously in public/fonts/.
import robotoRegularUrl from '@fontsource/roboto/files/roboto-latin-400-normal.woff?url';
import robotoBoldUrl from '@fontsource/roboto/files/roboto-latin-700-normal.woff?url';
import robotoMonoRegularUrl from '@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff?url';
import robotoMonoBoldUrl from '@fontsource/roboto-mono/files/roboto-mono-latin-700-normal.woff?url';

// ============================================================================
// FONTS
// ============================================================================
Font.register({
    family: 'Roboto',
    fonts: [
        { src: robotoRegularUrl, fontWeight: 'normal' },
        { src: robotoBoldUrl, fontWeight: 'bold' },
    ],
});

Font.register({
    family: 'RobotoMono',
    fonts: [
        { src: robotoMonoRegularUrl, fontWeight: 'normal' },
        { src: robotoMonoBoldUrl, fontWeight: 'bold' },
    ],
});

// ============================================================================
// HELPERS
// ============================================================================
const isFraction = (val: any): val is Fraction =>
    val !== null && typeof val === 'object' && 'n' in val && 'd' in val;

const formatNumber = (num: number | string | undefined): string => {
    if (num === undefined || num === null || num === '') return '';
    const str = String(num);
    const [int, dec] = str.split('.');
    const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return dec !== undefined ? `${formatted},${dec}` : formatted;
};

// ============================================================================
// COMPONENT
// ============================================================================
export const WorksheetPDF: React.FC<{
    blocks: MathBlock[];
    headerData: any;
    footerData: any;
    showSolutions: boolean;
}> = ({ blocks, headerData, footerData, showSolutions }) => {

    const totalScore = blocks.reduce((sum, b) => sum + (b.totalPoints || 0), 0);

    const renderFraction = (frac: Fraction, isSol: boolean): React.ReactElement => (
        <View style={S.fracContainer}>
            {frac.whole ? <Text style={isSol ? S.sol : S.mono}>{frac.whole} </Text> : null}
            <View style={S.fracStack}>
                <Text style={[S.fracTop, isSol ? { borderBottomColor: '#e11d48', color: '#e11d48' } : {}]}>
                    {frac.n}
                </Text>
                <Text style={[S.fracBot, isSol ? { color: '#e11d48' } : {}]}>
                    {frac.d}
                </Text>
            </View>
        </View>
    );

    const renderValue = (val: number | Fraction | undefined, isSol: boolean): React.ReactElement => {
        if (val === undefined || val === null) return <Text style={S.mono}>?</Text>;
        if (isFraction(val)) return renderFraction(val, isSol);
        return <Text style={isSol ? S.sol : S.mono}>{formatNumber(val as number)}</Text>;
    };

    // renderTerm: for the left side of the equation (operands)
    // If missing and showSolutions → show value in red; if missing → dotted blank; else → show value
    const renderTerm = (val: number | Fraction | undefined, isMissing: boolean): React.ReactElement => {
        if (!isMissing) return renderValue(val, false);
        if (showSolutions) return renderValue(val, true);
        return <View style={S.blankDotted} />;
    };

    const renderExercise = (ex: Equation, block: MathBlock): React.ReactElement => {
        const m1 = ex.missingTerm === 'operand1';
        const m2 = ex.missingTerm === 'operand2';
        const mResult = !m1 && !m2;
        const lineCount = block.layoutPreset === 'stepped' ? (block.steppedLines || 3) : 1;
        // Match viewer: stepped line gap is verticalSpacing * 0.8
        const lineGap = (block.verticalSpacing || 14) * 0.8;
        const isShort = block.layoutPreset === 'inline-short';

        return (
            // alignItems: flex-start so the equation aligns with the TOP of the answer area,
            // not the bottom. This fixes stepped layout where the answer area is much taller.
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                {/* Equation: constrained to the height of ONE answer slot so it always
                    lines up with the first answer line, even in stepped mode. */}
                <View style={{ height: 30, flexDirection: 'row', alignItems: 'flex-end' }}>
                    <View style={S.operandSlot}>{renderTerm(ex.operands[0], m1)}</View>
                    <Text style={S.op}>{ex.operator}</Text>
                    <View style={S.operandSlot}>{renderTerm(ex.operands[1], m2)}</View>
                </View>

                {/* Answer slots */}
                <View style={{ flex: 1, marginLeft: 8 }}>
                    {mResult ? (
                        Array.from({ length: lineCount }).map((_, i) => (
                            <View key={i} style={[S.answerSlot, { marginBottom: i < lineCount - 1 ? lineGap : 0 }]}>
                                <Text style={i === 0 ? S.eq : S.eqHidden}>=</Text>
                                {i === 0 && showSolutions
                                    ? renderValue(ex.answer, true)
                                    : <View style={isShort ? S.workLineShort : S.workLineLong} />
                                }
                            </View>
                        ))
                    ) : (
                        <View style={S.answerSlot}>
                            <Text style={S.eq}>=</Text>
                            {renderValue(ex.answer, true)}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    // Match the viewer's fallback labels when fields are empty
    const footerLeft = [
        footerData?.school || 'School',
        footerData?.klas || 'Klas',
        footerData?.leerkracht || 'Leerkracht',
    ].join(' | ');

    return (
        <Document title={headerData?.titel || 'Oefenblad'}>
            <Page size="A4" style={S.page}>

                {/* TITLE */}
                {headerData?.titel ? (
                    <Text style={S.title}>{headerData.titel}</Text>
                ) : null}

                {/* HEADNOTES ROW + SCORE BOX */}
                <View style={S.headRow}>
                    <View style={S.headFields}>
                        {headerData?.naam ? (
                            <View style={[S.headField, { flex: 2, minWidth: 130 }]}>
                                <Text style={S.headLabel}>Naam:</Text>
                                <View style={S.headLine} />
                            </View>
                        ) : null}
                        {headerData?.klas ? (
                            <View style={[S.headField, { width: 80 }]}>
                                <Text style={S.headLabel}>Klas:</Text>
                                <View style={S.headLine} />
                            </View>
                        ) : null}
                        {headerData?.nummer ? (
                            <View style={[S.headField, { width: 60 }]}>
                                <Text style={S.headLabel}>Nr:</Text>
                                <View style={S.headLine} />
                            </View>
                        ) : null}
                        {headerData?.datum ? (
                            <View style={[S.headField, { flex: 1, minWidth: 100 }]}>
                                <Text style={S.headLabel}>Datum:</Text>
                                <View style={S.headLine} />
                            </View>
                        ) : null}
                    </View>
                    {totalScore > 0 ? (
                        <View style={S.scoreBox}>
                            <Text style={S.scoreLabel}>Score:</Text>
                            <Text style={S.scoreValue}>___ / {totalScore}</Text>
                        </View>
                    ) : null}
                </View>

                {/* EXERCISE BLOCKS */}
                <View style={{ flex: 1 }}>
                    {blocks.map((block) => {
                        const spacing = block.verticalSpacing || 14;
                        const is2Col = block.layoutPreset === 'inline-short';

                        const blockHeader = (
                            <View style={S.blockHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    {block.instructionMode === 'mag' ? <Text style={S.badgeMag}>MAG</Text> : null}
                                    {block.instructionMode === 'moet' ? <Text style={S.badgeMoet}>MOET</Text> : null}
                                    <Text style={S.instruction}>{block.instructionText}</Text>
                                </View>
                                {(block.totalPoints || 0) > 0 ? (
                                    <Text style={S.points}>__ / {block.totalPoints}</Text>
                                ) : null}
                            </View>
                        );

                        return (
                            <View key={block.id} style={{ marginBottom: 20 }}>
                                {is2Col ? (
                                    // 2-column: header sits above the grid; pairs of exercises
                                    // flow naturally across pages without splitting mid-exercise.
                                    <>
                                        {blockHeader}
                                        <View style={S.grid2col}>
                                            {block.exercises?.map((ex) => (
                                                <View key={ex.id} style={{ width: '50%', marginBottom: spacing, paddingRight: 24 }}>
                                                    {renderExercise(ex, block)}
                                                </View>
                                            ))}
                                        </View>
                                    </>
                                ) : (
                                    // 1-column (inline-long / stepped): each exercise is kept
                                    // whole on one page. The header is bundled with the first
                                    // exercise so it never appears as an orphan at the bottom.
                                    block.exercises?.map((ex, i) => (
                                        <View key={ex.id} wrap={false} style={{ marginBottom: spacing }}>
                                            {i === 0 && blockHeader}
                                            {renderExercise(ex, block)}
                                        </View>
                                    ))
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* FOOTER — fixed so it appears on every page */}
                <View style={S.footer} fixed>
                    <Text style={{ flex: 1 }}>{footerLeft}</Text>
                    <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} / ${totalPages}`} />
                </View>

            </Page>
        </Document>
    );
};

// ============================================================================
// STYLES
// ============================================================================
const S = StyleSheet.create({
    page: { padding: 40, paddingBottom: 64, fontFamily: 'Roboto', fontSize: 12 },

    title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },

    headRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 24 },
    headFields: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', marginRight: 12 },
    headField: { flexDirection: 'row', alignItems: 'flex-end', marginRight: 10, marginBottom: 4 },
    headLabel: { fontSize: 11, fontWeight: 'bold', marginRight: 4, flexShrink: 0 },
    headLine: { borderBottomWidth: 1.5, flex: 1, height: 14, minWidth: 30 },
    scoreBox: { borderWidth: 2, borderColor: '#000', padding: 8, alignItems: 'center', justifyContent: 'center', minWidth: 80 },
    scoreLabel: { fontSize: 9, fontWeight: 'bold' },
    scoreValue: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },

    blockHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' },
    instruction: { fontSize: 14, fontWeight: 'bold' },
    points: { fontSize: 12, fontWeight: 'bold' },
    badgeMag: { fontSize: 8, fontWeight: 'bold', backgroundColor: '#4ade80', color: '#14532d', paddingTop: 2, paddingBottom: 2, paddingLeft: 5, paddingRight: 5, marginRight: 6 },
    badgeMoet: { fontSize: 8, fontWeight: 'bold', backgroundColor: '#f87171', color: '#7f1d1d', paddingTop: 2, paddingBottom: 2, paddingLeft: 5, paddingRight: 5, marginRight: 6 },

    grid2col: { flexDirection: 'row', flexWrap: 'wrap' },
    grid1col: { flexDirection: 'column' },

    // operandSlot: fixed-width right-aligned box so columns stay consistent across rows
    operandSlot: { width: 50, alignItems: 'flex-end' },
    op: { fontFamily: 'RobotoMono', fontSize: 14, marginLeft: 5, marginRight: 5 },
    // answerSlot: tall enough to write in, line pinned to the bottom
    answerSlot: { flexDirection: 'row', alignItems: 'flex-end', height: 30 },
    eq: { fontFamily: 'RobotoMono', fontSize: 14, marginRight: 6, width: 14 },
    eqHidden: { fontFamily: 'RobotoMono', fontSize: 14, marginRight: 6, width: 14, opacity: 0 },
    mono: { fontFamily: 'RobotoMono', fontSize: 14 },
    sol: { fontFamily: 'RobotoMono', fontSize: 14, color: '#e11d48', fontWeight: 'bold' },
    blankDotted: { borderBottomWidth: 1, borderStyle: 'dashed', width: 40, height: 14 },
    workLineShort: { borderBottomWidth: 1.5, width: 60, height: 2 },
    workLineLong: { borderBottomWidth: 1.5, flex: 1, height: 2 },

    fracContainer: { flexDirection: 'row', alignItems: 'center' },
    fracStack: { flexDirection: 'column', alignItems: 'center' },
    fracTop: { borderBottomWidth: 1, fontSize: 10, fontFamily: 'RobotoMono', paddingLeft: 3, paddingRight: 3, minWidth: 18, textAlign: 'center' },
    fracBot: { fontSize: 10, fontFamily: 'RobotoMono', paddingLeft: 3, paddingRight: 3, minWidth: 18, textAlign: 'center' },

    footer: { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, color: '#666', borderTopWidth: 1, paddingTop: 6 },
});
