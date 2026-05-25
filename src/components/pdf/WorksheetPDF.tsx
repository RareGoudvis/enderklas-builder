import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Svg, Circle, Line, Rect, Path } from '@react-pdf/renderer';
import type { MathBlock, Fraction, Equation, ClockExercise, FractionExercise } from '../../services/math/types';
import type { DocSettings } from '../../store/useWorksheetStore';

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
// ANALOG CLOCK SVG (PDF)
// ============================================================================

const renderAnalogClockPDF = (
    hours: number, minutes: number,
    showHourHand: boolean, showMinuteHand: boolean,
    is24hour: boolean, size = 80
): React.ReactElement => {
    // Keep SVG always size×size so the PDF grid layout stays unchanged.
    // In 24h mode, reduce r slightly so the 13-24 outer ring fits inside the same canvas.
    const svgSize = size;
    const cx = svgSize / 2, cy = svgSize / 2;
    const r = is24hour ? size / 2 - 11 : size / 2 - 3;
    const outerNumR = r + 8;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const pt = (angleDeg: number, dist: number) => ({
        x: cx + Math.sin(toRad(angleDeg)) * dist,
        y: cy - Math.cos(toRad(angleDeg)) * dist,
    });

    const hourAngle = ((hours % 12) * 360 / 12) + (minutes * 360 / (12 * 60));
    const minuteAngle = minutes * 6;
    const hourEnd = pt(hourAngle, r * 0.58);
    const minuteEnd = pt(minuteAngle, r * 0.82);
    const numFontSize = Math.max(5, size * 0.080);
    const smallFontSize = Math.max(4, size * 0.058);

    return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle cx={cx} cy={cy} r={r} fill="white" stroke="black" strokeWidth={1.5} />
            {/* 60 minute tick marks */}
            {Array.from({ length: 60 }, (_, i) => {
                const angle = i * 6;
                const isQuarter = i % 15 === 0;
                const isHour = i % 5 === 0;
                const inner = pt(angle, r * (isQuarter ? 0.80 : isHour ? 0.86 : 0.91));
                const outer = pt(angle, r * 0.96);
                return (
                    <Line key={i}
                        x1={inner.x} y1={inner.y}
                        x2={outer.x} y2={outer.y}
                        stroke="black"
                        strokeWidth={isQuarter ? 1.5 : isHour ? 1 : 0.5}
                    />
                );
            })}
            {/* Hour numbers 1-12 inside the circle */}
            {Array.from({ length: 12 }, (_, i) => {
                const angle = i * 30;
                const label12 = i === 0 ? 12 : i;
                const numPos = pt(angle, r * 0.72);
                return (
                    <Text key={`n12-${i}`}
                        x={numPos.x} y={numPos.y}
                        textAnchor="middle"
                        fill="black"
                        style={{ fontSize: numFontSize }}>
                        {String(label12)}
                    </Text>
                );
            })}
            {/* 13-24 numbers outside the circle in 24h mode */}
            {is24hour && Array.from({ length: 12 }, (_, i) => {
                const angle = i * 30;
                const label24 = (i === 0 ? 12 : i) + 12;
                const numPos = pt(angle, outerNumR);
                return (
                    <Text key={`n24-${i}`}
                        x={numPos.x} y={numPos.y}
                        textAnchor="middle"
                        fill="black"
                        style={{ fontSize: smallFontSize, fontWeight: 'bold' }}>
                        {String(label24)}
                    </Text>
                );
            })}
            {showHourHand && (
                <Line x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y} stroke="black" strokeWidth={2} />
            )}
            {showMinuteHand && (
                <Line x1={cx} y1={cy} x2={minuteEnd.x} y2={minuteEnd.y} stroke="black" strokeWidth={1.5} />
            )}
            <Circle cx={cx} cy={cy} r={2} fill="black" />
        </Svg>
    );
};

// ============================================================================
// COMPONENT
// ============================================================================
export const WorksheetPDF: React.FC<{
    blocks: MathBlock[];
    headerData: any;
    footerData: any;
    showSolutions: boolean;
    docSettings: DocSettings;
}> = ({ blocks, headerData, footerData, showSolutions, docSettings }) => {

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

    const renderClockExercisePDF = (ex: ClockExercise, block: MathBlock): React.ReactElement => {
        const clockType = block.constraints.clockType || 'analoog';
        const exerciseMode = block.constraints.exerciseMode || 'lezen';
        const is24hour = block.constraints.is24hour || false;
        const handChoice = block.constraints.handChoice || 'beide';

        const clock = (showH: boolean, showM: boolean) =>
            renderAnalogClockPDF(ex.hours, ex.minutes, showH, showM, is24hour, 80);

        const digitalBox = (
            <View style={{ borderWidth: 1.5, padding: 4, alignItems: 'center' }}>
                <Text style={S.mono}>{ex.digitalText}</Text>
            </View>
        );
        const timeLabel = <Text style={{ fontSize: 10, fontFamily: 'Roboto', fontWeight: 'bold', textAlign: 'center' }}>{ex.timeText}</Text>;
        const blankLine = <View style={{ borderBottomWidth: 1.5, width: 70, height: 14, marginTop: 4 }} />;
        const sol = (text: string) => <Text style={[S.sol, { fontSize: 10, textAlign: 'center' }]}>{text}</Text>;

        if (exerciseMode === 'tekenen') {
            let showH = showSolutions, showM = showSolutions;
            if (!showSolutions) { showH = handChoice === 'minuut'; showM = handChoice === 'uur'; }
            return (
                <View style={{ alignItems: 'center' }}>
                    <View style={{ marginBottom: 4 }}>{clockType === 'digitaal' ? digitalBox : timeLabel}</View>
                    {clock(showH, showM)}
                </View>
            );
        } else if (exerciseMode === 'lezen') {
            const display = clockType === 'analoog' ? clock(true, true) : digitalBox;
            return (
                <View style={{ alignItems: 'center' }}>
                    {display}
                    <View style={{ marginTop: 4 }}>{showSolutions ? sol(ex.timeText) : blankLine}</View>
                </View>
            );
        } else {
            if (clockType === 'analoog') {
                return (
                    <View style={{ alignItems: 'center' }}>
                        {clock(true, true)}
                        <View style={{ marginTop: 4 }}>
                            {showSolutions
                                ? sol(ex.digitalText)
                                : <View style={{ borderWidth: 1.5, width: 50, height: 20, alignItems: 'center', justifyContent: 'center' }}><Text style={[S.mono, { fontSize: 9, color: '#999' }]}>__:__</Text></View>
                            }
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={{ alignItems: 'center' }}>
                        {digitalBox}
                        <View style={{ marginTop: 4 }}>{showSolutions ? sol(ex.timeText) : blankLine}</View>
                    </View>
                );
            }
        }
    };

    // ── PDF helpers ──────────────────────────────────────────────────────────

    const polarXY = (cx: number, cy: number, r: number, deg: number) => {
        const rad = (deg - 90) * Math.PI / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    const renderFractionExercisePDF = (ex: FractionExercise, block: MathBlock): React.ReactElement => {
        const subType = ex.subType;
        const FILL = '#93c5fd';

        // ── SHAPE (kleuren / herkennen / tekenen) ────────────────────────────
        if (subType === 'kleuren' || subType === 'herkennen' || subType === 'tekenen') {
            const isTekenen   = subType === 'tekenen';
            const isHerkennen = subType === 'herkennen';
            const showColored = isHerkennen;
            const answerFormat: string = block.constraints.answerFormat || 'fraction-questions';
            const cs = isTekenen ? 22 : 28;
            const coloredIndices = ex.coloredIndices ?? [];
            const gridRows = ex.gridRows ?? 1;
            const gridCols = ex.gridCols ?? ex.denominator;

            const shapeSvg = (() => {
                if (ex.shape === 'circle') {
                    const r = 32, m = 4, sz = r * 2 + m * 2;
                    const cx = sz / 2, cy = sz / 2;
                    const sliceDeg = 360 / ex.denominator;
                    return (
                        <Svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                            {ex.denominator === 1 ? (
                                <Circle cx={cx} cy={cy} r={r}
                                    fill={showColored && coloredIndices.includes(0) ? FILL : 'white'}
                                    stroke="black" strokeWidth={1.5} />
                            ) : (
                                Array.from({ length: ex.denominator }, (_, i) => {
                                    const p1 = polarXY(cx, cy, r, i * sliceDeg);
                                    const p2 = polarXY(cx, cy, r, (i + 1) * sliceDeg);
                                    const la = sliceDeg > 180 ? 1 : 0;
                                    const d = `M ${cx} ${cy} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${la} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
                                    return (
                                        <Path key={i} d={d}
                                            fill={showColored && coloredIndices.includes(i) ? FILL : 'white'}
                                            stroke="black" strokeWidth={1.5} />
                                    );
                                })
                            )}
                        </Svg>
                    );
                }
                const w = gridCols * cs, h = gridRows * cs;
                return (
                    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
                        {Array.from({ length: gridRows }, (_, row) =>
                            Array.from({ length: gridCols }, (_, col) => {
                                const idx = row * gridCols + col;
                                return (
                                    <Rect key={idx}
                                        x={col * cs} y={row * cs} width={cs} height={cs}
                                        fill={showColored && coloredIndices.includes(idx) ? FILL : 'white'}
                                        stroke="black" strokeWidth={1.5} />
                                );
                            })
                        )}
                    </Svg>
                );
            })();

            if (isHerkennen) {
                let answerEl: React.ReactElement;
                if (answerFormat === 'fraction-questions') {
                    answerEl = (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', marginBottom: 4 }}>Hoeveel gelijke delen neem ik?</Text>
                                <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold' }}>In hoeveel gelijke delen is het geheel verdeeld?</Text>
                            </View>
                            <View style={S.fracStack}>
                                <Text style={[S.fracTop, showSolutions ? { color: '#e11d48', borderBottomColor: '#e11d48' } : { color: 'transparent' }]}>{ex.numerator}</Text>
                                <Text style={[S.fracBot, showSolutions ? { color: '#e11d48' } : { color: 'transparent' }]}>{ex.denominator}</Text>
                            </View>
                        </View>
                    );
                } else if (answerFormat === 'phrase') {
                    answerEl = (
                        <View style={{ marginTop: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 2 }}>
                                <Text style={{ fontSize: 9, fontFamily: 'Roboto' }}>Er zijn </Text>
                                {showSolutions ? <Text style={[S.sol, { fontSize: 9 }]}>{ex.denominator}</Text> : <View style={{ borderBottomWidth: 1, width: 20, height: 10 }} />}
                                <Text style={{ fontSize: 9, fontFamily: 'Roboto' }}> gelijke delen.</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                {showSolutions ? <Text style={[S.sol, { fontSize: 9 }]}>{ex.numerator}</Text> : <View style={{ borderBottomWidth: 1, width: 20, height: 10 }} />}
                                <Text style={{ fontSize: 9, fontFamily: 'Roboto' }}> delen zijn ingekleurd.</Text>
                            </View>
                        </View>
                    );
                } else if (answerFormat === 'blank-fraction') {
                    answerEl = showSolutions ? (
                        <View style={S.fracContainer}>
                            <View style={S.fracStack}>
                                <Text style={[S.fracTop, { color: '#e11d48', borderBottomColor: '#e11d48' }]}>{ex.numerator}</Text>
                                <Text style={[S.fracBot, { color: '#e11d48' }]}>{ex.denominator}</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={S.fracContainer}>
                            <View style={S.fracStack}>
                                <View style={{ borderBottomWidth: 1, width: 20, height: 12 }} />
                                <View style={{ width: 20, height: 12 }} />
                            </View>
                        </View>
                    );
                } else {
                    answerEl = showSolutions
                        ? <Text style={[S.sol, { fontSize: 10, marginTop: 4 }]}>{ex.numerator}/{ex.denominator}</Text>
                        : <View style={{ borderBottomWidth: 1.5, width: 60, height: 12, marginTop: 4 }} />;
                }
                return (
                    <View style={{ alignItems: 'center' }}>
                        {shapeSvg}
                        {answerEl}
                    </View>
                );
            }

            const label = subType === 'tekenen'
                ? `Teken ${ex.numerator}/${ex.denominator} in:`
                : `Kleur ${ex.numerator}/${ex.denominator} in:`;
            return (
                <View style={{ alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 10, fontFamily: 'Roboto', fontWeight: 'bold' }}>{label}</Text>
                    {shapeSvg}
                </View>
            );
        }

        // ── AMOUNT CONCREET (hoeveelheid) ────────────────────────────────────
        if (subType === 'hoeveelheid') {
            const amountFormat: string = block.constraints.answerFormat || 'met-hulp';
            const os = 12, gap = 2, perRow = 10;
            const total = ex.total ?? 0;
            const coloredCount = Math.round(total * ex.numerator / ex.denominator);
            const groupSize = total / ex.denominator;
            const objectShape = ex.objectShape ?? 'circle';

            const objEl = (idx: number, colored: boolean): React.ReactElement => (
                <Svg key={idx} width={os} height={os} viewBox={`0 0 ${os} ${os}`}>
                    {objectShape === 'circle'
                        ? <Circle cx={os / 2} cy={os / 2} r={os / 2 - 1} fill={colored ? FILL : 'white'} stroke="black" strokeWidth={1} />
                        : <Rect x={1} y={1} width={os - 2} height={os - 2} fill={colored ? FILL : 'white'} stroke="black" strokeWidth={1} />
                    }
                </Svg>
            );

            const fracLabel = (
                <View style={S.fracContainer}>
                    <View style={S.fracStack}>
                        <Text style={S.fracTop}>{ex.numerator}</Text>
                        <Text style={S.fracBot}>{ex.denominator}</Text>
                    </View>
                </View>
            );

            const questionLine = (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    {fracLabel}
                    <Text style={S.mono}> van {total} = </Text>
                    {showSolutions ? <Text style={S.sol}>{String(coloredCount)}</Text> : <View style={{ borderBottomWidth: 1.5, width: 28, height: 12 }} />}
                </View>
            );

            const simpleGrid = (
                <View>
                    {Array.from({ length: Math.ceil(total / perRow) }, (_, row) => (
                        <View key={row} style={{ flexDirection: 'row', gap, marginBottom: gap }}>
                            {Array.from({ length: Math.min(perRow, total - row * perRow) }, (_, col) => {
                                const idx = row * perRow + col;
                                return objEl(idx, showSolutions && idx < coloredCount);
                            })}
                        </View>
                    ))}
                </View>
            );

            const groupedGrid = (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    {Array.from({ length: ex.denominator }, (_, g) => (
                        <View key={g} style={{ alignItems: 'center', marginRight: g < ex.denominator - 1 ? 6 : 0, borderRightWidth: g < ex.denominator - 1 ? 1 : 0, paddingRight: g < ex.denominator - 1 ? 6 : 0 }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, maxWidth: Math.ceil(Math.sqrt(groupSize)) * (os + gap) }}>
                                {Array.from({ length: groupSize }, (_, k) => objEl(g * groupSize + k, showSolutions && g < ex.numerator))}
                            </View>
                            {showSolutions ? <Text style={[S.sol, { fontSize: 8, marginTop: 2 }]}>{groupSize}</Text> : <View style={{ borderBottomWidth: 1, width: 18, height: 10, marginTop: 2 }} />}
                        </View>
                    ))}
                </View>
            );

            if (amountFormat === 'zonder-hulp') return <View>{simpleGrid}{questionLine}</View>;
            if (amountFormat === 'met-hulp')    return <View>{groupedGrid}{questionLine}</View>;
            return (
                <View>
                    {simpleGrid}
                    <View style={{ marginTop: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 2 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Roboto' }}>Hoeveel delen? </Text>
                            {showSolutions ? <Text style={[S.sol, { fontSize: 9 }]}>{ex.denominator}</Text> : <View style={{ borderBottomWidth: 1, width: 18, height: 10 }} />}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 2 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Roboto' }}>{total} ÷ {ex.denominator} = </Text>
                            {showSolutions ? <Text style={[S.sol, { fontSize: 9 }]}>{groupSize}</Text> : <View style={{ borderBottomWidth: 1, width: 18, height: 10 }} />}
                        </View>
                        {questionLine}
                    </View>
                </View>
            );
        }

        // ── AMOUNT SCHEMATISCH (hoeveelheid-rechthoek) ───────────────────────
        if (subType === 'hoeveelheid-rechthoek') {
            const rectFormat: string = block.constraints.answerFormat || 'met-berekening';
            const total = ex.total ?? 0;
            const groupSize = total / ex.denominator;
            const coloredCount = groupSize * ex.numerator;

            const fracLabel = (
                <View style={S.fracContainer}>
                    <View style={S.fracStack}>
                        <Text style={S.fracTop}>{ex.numerator}</Text>
                        <Text style={S.fracBot}>{ex.denominator}</Text>
                    </View>
                </View>
            );

            return (
                <View style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {fracLabel}
                        <Text style={S.mono}> van {total} = </Text>
                        {showSolutions ? <Text style={S.sol}>{String(coloredCount)}</Text> : <View style={{ borderBottomWidth: 1.5, width: 28, height: 12 }} />}
                    </View>
                    <View style={{ borderWidth: 1.5, width: '100%', height: 40 }} />
                    {rectFormat === 'met-berekening' && (
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 2 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                                <Text style={S.mono}>{total} ÷ </Text>
                                {showSolutions ? <Text style={S.sol}>{String(ex.denominator)}</Text> : <View style={{ borderBottomWidth: 1, width: 18, height: 10 }} />}
                                <Text style={S.mono}> = </Text>
                                {showSolutions ? <Text style={S.sol}>{String(groupSize)}</Text> : <View style={{ borderBottomWidth: 1, width: 18, height: 10 }} />}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                                {showSolutions ? <Text style={S.sol}>{String(ex.numerator)}</Text> : <View style={{ borderBottomWidth: 1, width: 18, height: 10 }} />}
                                <Text style={S.mono}> × </Text>
                                {showSolutions ? <Text style={S.sol}>{String(groupSize)}</Text> : <View style={{ borderBottomWidth: 1, width: 18, height: 10 }} />}
                                <Text style={S.mono}> = </Text>
                                {showSolutions ? <Text style={S.sol}>{String(coloredCount)}</Text> : <View style={{ borderBottomWidth: 1, width: 18, height: 10 }} />}
                            </View>
                        </View>
                    )}
                </View>
            );
        }

        // ── LIJNSTUK ─────────────────────────────────────────────────────────
        if (subType === 'lijnstuk') {
            const cm = ex.lineLength ?? 10;
            const level = block.constraints.level ?? 1;
            const partLength = cm / ex.denominator;
            const arcLength  = partLength * ex.numerator;
            const lineW = Math.min(cm * 10, 400);

            const lineEl = (
                <View style={{ marginVertical: 6 }}>
                    <Svg width={lineW + 4} height={20} viewBox={`0 0 ${lineW + 4} 20`}>
                        <Line x1={2} y1={4} x2={2} y2={16} stroke="black" strokeWidth={1.5} />
                        <Line x1={2} y1={10} x2={lineW + 2} y2={10} stroke="black" strokeWidth={1.5} />
                        <Line x1={lineW + 2} y1={4} x2={lineW + 2} y2={16} stroke="black" strokeWidth={1.5} />
                    </Svg>
                    <Text style={{ fontSize: 8, fontFamily: 'Roboto', color: '#555', textAlign: 'center' }}>{cm} cm</Text>
                </View>
            );

            const calcLines = (
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                        {showSolutions ? <Text style={S.sol}>{String(cm)}</Text> : <View style={{ borderBottomWidth: 1, width: 24, height: 10 }} />}
                        <Text style={S.mono}> cm ÷ </Text>
                        {showSolutions ? <Text style={S.sol}>{String(ex.denominator)}</Text> : <View style={{ borderBottomWidth: 1, width: 18, height: 10 }} />}
                        <Text style={S.mono}> = </Text>
                        {showSolutions ? <Text style={S.sol}>{String(partLength)}</Text> : <View style={{ borderBottomWidth: 1, width: 24, height: 10 }} />}
                        <Text style={S.mono}> cm</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                        {showSolutions ? <Text style={S.sol}>{String(ex.numerator)}</Text> : <View style={{ borderBottomWidth: 1, width: 18, height: 10 }} />}
                        <Text style={S.mono}> × </Text>
                        {showSolutions ? <Text style={S.sol}>{String(partLength)}</Text> : <View style={{ borderBottomWidth: 1, width: 24, height: 10 }} />}
                        <Text style={S.mono}> cm = </Text>
                        {showSolutions ? <Text style={S.sol}>{String(arcLength)}</Text> : <View style={{ borderBottomWidth: 1, width: 24, height: 10 }} />}
                        <Text style={S.mono}> cm</Text>
                    </View>
                </View>
            );

            if (level === 1) {
                return (
                    <View style={{ gap: 4 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Roboto' }}>Verdeel het lijnstuk in <Text style={{ fontWeight: 'bold' }}>{ex.denominator}</Text> gelijke delen.</Text>
                        <Text style={{ fontSize: 9, fontFamily: 'Roboto' }}>Teken een boogje boven <Text style={{ fontWeight: 'bold' }}>{ex.numerator}/{ex.denominator}</Text> van het lijnstuk.</Text>
                        {lineEl}
                        {calcLines}
                    </View>
                );
            }
            if (level === 2) return <View style={{ gap: 4 }}>{lineEl}{calcLines}</View>;
            return (
                <View style={{ gap: 4 }}>
                    {lineEl}
                    <View style={{ borderBottomWidth: 1.5, height: 16 }} />
                    <View style={{ borderBottomWidth: 1.5, height: 16 }} />
                </View>
            );
        }

        return <View />;
    };

    const renderExercise = (ex: Equation, block: MathBlock): React.ReactElement => {
        // MET REST
        if (ex.remainder !== undefined) {
            const helpBlank = <View style={{ borderBottomWidth: 1, borderStyle: 'dashed', width: 35, height: 14 }} />;
            const qPart = showSolutions
                ? <Text style={S.sol}>{formatNumber(ex.answer as number)}</Text>
                : <View style={{ borderBottomWidth: 1.5, width: 40, height: 2 }} />;
            const rPart = showSolutions
                ? <Text style={S.sol}>{String(ex.remainder)}</Text>
                : <View style={{ borderBottomWidth: 1.5, width: 28, height: 2 }} />;
            return (
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 30 }}>
                    <Text style={S.mono}>(</Text>
                    {helpBlank}
                    <Text style={S.mono}>)</Text>
                    <Text style={S.mono}> {formatNumber(ex.operands[0] as number)} : {formatNumber(ex.operands[1] as number)} = </Text>
                    {qPart}
                    <Text style={[S.mono, { fontStyle: 'italic' }]}> r </Text>
                    {rPart}
                </View>
            );
        }

        const m1 = ex.missingTerm === 'operand1';
        const m2 = ex.missingTerm === 'operand2';
        const mResult = !m1 && !m2;
        const lineCount = block.layoutPreset === 'stepped' ? (block.steppedLines || 3) : 1;
        // Match viewer: stepped line gap is verticalSpacing * 0.8
        const lineGap = (block.verticalSpacing || 14) * 0.8;
        const isShort = block.layoutPreset === 'inline-short';

        return (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ height: 30, flexDirection: 'row', alignItems: 'center' }}>
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

    const footerLeft = [
        footerData?.showSchool ? (footerData?.school || 'School') : null,
        footerData?.showKlas ? (footerData?.klas || 'Klas') : null,
        footerData?.showLeerkracht ? (footerData?.leerkracht || 'Leerkracht') : null,
    ].filter(Boolean).join(' | ');

    return (
        <Document title={headerData?.titel || 'Oefenblad'}>
            <Page size="A4" style={S.page}>

                {/* HEADER AREA (headnotes + title), optionally framed */}
                <View style={docSettings.headerStyle === 'kader' ? S.headerKader : undefined}>
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
                        {docSettings.showScores && totalScore > 0 ? (
                            <View style={S.scoreBox}>
                                <Text style={S.scoreLabel}>Score:</Text>
                                <Text style={S.scoreValue}>___ / {totalScore}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* TITLE */}
                    {headerData?.titel ? (
                        <Text style={S.title}>{headerData.titel}</Text>
                    ) : null}
                </View>

                {/* EXERCISE BLOCKS */}
                <View style={{ flex: 1 }}>
                    {blocks.map((block, blockIndex) => {
                        const spacing = block.verticalSpacing || 14;
                        const is2Col = block.layoutPreset === 'inline-short';
                        const isNotLastBlock = blockIndex < blocks.length - 1;

                        const titleRowStyle = docSettings.opdrachtTitelStyle === 'boxed'
                            ? { ...S.blockHeader, borderWidth: 1, paddingTop: 4, paddingBottom: 4, paddingLeft: 6, paddingRight: 6 }
                            : docSettings.opdrachtTitelStyle === 'underlined'
                                ? { ...S.blockHeader, borderBottomWidth: 1.5, paddingBottom: 4 }
                                : S.blockHeader;

                        const blockHeader = (
                            <View style={titleRowStyle}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    {block.instructionMode === 'mag' ? <Text style={S.badgeMag}>MAG</Text> : null}
                                    {block.instructionMode === 'moet' ? <Text style={S.badgeMoet}>MOET</Text> : null}
                                    {block.instructionMode === 'plus' ? <Text style={S.badgePlus}>★</Text> : null}
                                    <Text style={S.instruction}>{block.instructionText}</Text>
                                </View>
                                {docSettings.showScores && (block.totalPoints || 0) > 0 ? (
                                    <Text style={S.points}>__ / {block.totalPoints}</Text>
                                ) : null}
                            </View>
                        );

                        return (
                            <View key={block.id} style={{ marginBottom: 20, ...(docSettings.showDividers && isNotLastBlock ? { borderBottomWidth: 0.5, borderBottomColor: '#e5e5e5', paddingBottom: 8 } : {}) }}>
                                {block.typeId.startsWith('klok-') ? (
                                    <>
                                        {blockHeader}
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                            {((block.clockExercises || []) as ClockExercise[]).map((ex) => (
                                                <View key={ex.id} style={{ width: '33%', marginBottom: 12, padding: 4, alignItems: 'center' }}>
                                                    {renderClockExercisePDF(ex, block)}
                                                </View>
                                            ))}
                                        </View>
                                    </>
                                ) : block.typeId === 'breuken' ? (
                                    <>
                                        {blockHeader}
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                            {(block.fractionExercises || []).map((ex) => (
                                                <View key={ex.id} style={{ width: ex.subType === 'lijnstuk' ? '100%' : '50%', marginBottom: spacing, paddingRight: ex.subType === 'lijnstuk' ? 0 : 16 }}>
                                                    {renderFractionExercisePDF(ex, block)}
                                                </View>
                                            ))}
                                        </View>
                                    </>
                                ) : is2Col ? (
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
                    {footerData?.showPagina ? (
                        <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} / ${totalPages}`} />
                    ) : null}
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

    title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 8, marginBottom: 20 },

    headerKader: { borderWidth: 1.5, borderColor: '#000', padding: 8, marginBottom: 8 },
    headRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
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
    badgePlus: { fontSize: 8, fontWeight: 'bold', backgroundColor: '#3b82f6', color: '#eff6ff', paddingTop: 2, paddingBottom: 2, paddingLeft: 5, paddingRight: 5, marginRight: 6 },

    grid2col: { flexDirection: 'row', flexWrap: 'wrap' },
    grid1col: { flexDirection: 'column' },

    // operandSlot: fixed-width right-aligned box so columns stay consistent across rows
    operandSlot: { width: 50, alignItems: 'flex-end' },
    op: { fontFamily: 'RobotoMono', fontSize: 14, marginLeft: 5, marginRight: 5 },
    answerSlot: { flexDirection: 'row', alignItems: 'center', height: 30 },
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
