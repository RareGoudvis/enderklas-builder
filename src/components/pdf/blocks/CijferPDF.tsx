import { View, Text, Svg, Line } from '@react-pdf/renderer';
import type { MathBlock } from '../../../services/math/types';
import type { CijferExercise, CijferConstraints } from '../../../services/math/types';

const GRID_COLOR = '#aaaaaa';
const SOL_COLOR = '#e11d48';
const PLACE_ABBREVS = ['E', 'T', 'H', 'D', 'TD', 'HD', 'M'];
const DEC_ABBREVS = ['t', 'h', 'd'];

// A4 content width in pt (595 - 2×30 margins)
const A4_CONTENT_PT = 535;
const ROW_GAP_PT = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────

function intLen(n: number): number {
    const abs = Math.abs(Math.floor(n));
    return abs === 0 ? 1 : String(abs).length;
}

function fmtDisplay(n: number, dp: number): string {
    const s = dp > 0 ? Math.abs(n).toFixed(dp) : String(Math.abs(Math.round(n)));
    const [intP, decP] = s.split('.');
    const intFmt = intP.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return dp > 0 ? `${intFmt},${decP}` : intFmt;
}

function computeEstimation(ex: CijferExercise): string {
    const roundSig = (n: number): number => {
        if (n === 0) return 0;
        const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(n))) - 1);
        return Math.round(n / mag) * mag;
    };
    const fmtR = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const opStr = ex.operator === 'x' ? '×' : ex.operator === ':' ? '÷' : ex.operator;
    const rounded = ex.operands.map(o => roundSig(parseFloat(o.toFixed(0))));
    let est = rounded[0];
    for (let i = 1; i < rounded.length; i++) {
        if (ex.operator === '+') est += rounded[i];
        else if (ex.operator === '-') est -= rounded[i];
        else if (ex.operator === 'x') est *= rounded[i];
        else if (ex.operator === ':') est = Math.round(est / rounded[i]);
    }
    return rounded.map(fmtR).join(` ${opStr} `) + ` ≈ ${fmtR(est)}`;
}

// Decimal cols at intCols+i (no comma column).
function getDigitCols(num: number, dp: number, intCols: number): { col: number; char: string }[] {
    const s = dp > 0 ? Math.abs(num).toFixed(dp) : String(Math.abs(Math.round(num)));
    const [intPart = '0', decPart = ''] = s.split('.');
    const result: { col: number; char: string }[] = [];
    const padded = intPart.padStart(intCols, '0');
    let found = false;
    for (let i = 0; i < intCols; i++) {
        if (padded[i] !== '0') found = true;
        if (found) result.push({ col: i, char: padded[i] });
    }
    if (!found) result.push({ col: intCols - 1, char: '0' });
    if (dp > 0) {
        const padDec = decPart.padEnd(dp, '0');
        for (let i = 0; i < dp; i++) result.push({ col: intCols + i, char: padDec[i] });
    }
    return result;
}

function ppDigitCols(value: number, intCols: number): { col: number; char: string }[] {
    if (value === 0) return [{ col: intCols - 1, char: '0' }];
    const s = String(Math.round(value));
    const offset = intCols - s.length;
    const result: { col: number; char: string }[] = [];
    let found = false;
    for (let i = 0; i < s.length; i++) {
        if (s[i] !== '0') found = true;
        if (found) result.push({ col: offset + i, char: s[i] });
    }
    return result;
}

function computeAddCarries(operands: number[], dp: number, intCols: number): { col: number; carry: number }[] {
    const totalPositions = intCols + dp;
    const carries: { col: number; carry: number }[] = [];
    let carry = 0;
    for (let pos = 0; pos < totalPositions + 1; pos++) {
        let sum = carry;
        for (const op of operands) {
            const scaled = Math.round(Math.abs(op) * Math.pow(10, dp));
            sum += Math.floor(scaled / Math.pow(10, pos)) % 10;
        }
        carry = Math.floor(sum / 10);
        if (carry > 0) {
            const correctedCol = pos < dp
                ? intCols + (dp - 1 - pos)     // decimal positions (no comma col offset)
                : intCols - 1 - (pos - dp);     // integer positions
            carries.push({ col: correctedCol, carry });
        }
    }
    return carries;
}

const toGridCol = (digitCol: number) => digitCol + 1;

// Place label for grid col. No comma column — decimal cols start at maxInt+1.
function placeLabel(gridCol: number, maxInt: number, dp: number): string | null {
    if (gridCol === 0) return null;
    if (gridCol >= 1 && gridCol <= maxInt) return PLACE_ABBREVS[maxInt - gridCol] ?? null;
    if (dp > 0 && gridCol > maxInt) return DEC_ABBREVS[gridCol - maxInt - 1] ?? null;
    return null;
}

function estimateExWidth(c: CijferConstraints): number {
    const CELL = c.gridCellSize || 25;
    const dp = c.numberType === 'decimal' ? (c.decimalPlaces || 2) : 0;
    const maxInt = String(Math.round(c.maxRange || 1000)).length;
    const extra = c.extraCols || 0;
    if (c.operator === ':') {
        const maxRange = c.maxRange || 1000;
        const divisorLen = maxRange <= 100 ? 1 : maxRange <= 10_000 ? 2 : 3;
        const dividendLen = String(Math.max(1, Math.round(maxRange) - 1)).length;
        const quotientLen = String(Math.max(1, Math.round(maxRange / 2))).length;
        const workingDecCols = dp > 0 ? Math.max(dp, 3) : 0;
        const leftCols = dividendLen + workingDecCols;
        const rightCols = Math.max(divisorLen, quotientLen + dp) + 2;
        return (leftCols + rightCols + extra) * CELL;
    }
    return (1 + maxInt + dp + extra) * CELL;
}

function computeExPerRow(c: CijferConstraints): number {
    const w = estimateExWidth(c);
    return Math.max(1, Math.min(4, Math.floor((A4_CONTENT_PT + ROW_GAP_PT) / (w + ROW_GAP_PT))));
}

// ── Digit overlay ─────────────────────────────────────────────────────────────

interface DigitOverlayProps { col: number; row: number; char: string; CELL: number; color?: string; small?: boolean; }

function DigitOverlay({ col, row, char, CELL, color = '#000', small = false }: DigitOverlayProps) {
    return (
        <View style={{ position: 'absolute', left: col * CELL, top: row * CELL, width: CELL, height: CELL, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'AzeretMono', fontSize: small ? CELL * 0.42 : CELL * 0.62, color, fontWeight: 'normal' }}>{char}</Text>
        </View>
    );
}

// Small comma at right edge of E column (no dedicated column).
function CommaEdgePDF({ afterGridCol, row, CELL }: { afterGridCol: number; row: number; CELL: number }) {
    return (
        <View style={{
            position: 'absolute',
            left: (afterGridCol + 1) * CELL - CELL * 0.28,
            top: row * CELL + CELL * 0.55,
            width: CELL * 0.32,
            height: CELL * 0.45,
            alignItems: 'center',
            justifyContent: 'flex-end',
        }}>
            <Text style={{ fontFamily: 'AzeretMono', fontSize: CELL * 0.50, color: '#888888' }}>,</Text>
        </View>
    );
}

// ── Add/Sub grid ──────────────────────────────────────────────────────────────

interface GridBaseProps { ex: CijferExercise; c: CijferConstraints; CELL: number; dp: number; scaffolding: number; showSolutions: boolean; }

function AddSubGrid({ ex, CELL, dp, scaffolding, showSolutions, c }: GridBaseProps) {
    const numTerms = ex.operands.length;
    const allNums = [...ex.operands, ex.answer];
    const maxInt = Math.max(...allNums.map(n => intLen(n)));
    const decCols = dp;  // no dedicated comma column
    const extraCols = c.extraCols || 0;
    const extraRows = c.extraRows || 0;

    const gridCols = 1 + maxInt + decCols + extraCols;
    const freeRows = ex.operator === '-' ? 2 : 1;
    const firstOperandRow = 1 + freeRows;
    const lastOperandRow = firstOperandRow + numTerms - 1;
    const lineRow = lastOperandRow + 1;
    const answerRow = lineRow + 1;
    const totalRows = answerRow + 1 + extraRows;

    const gridW = gridCols * CELL;
    const gridH = totalRows * CELL;
    const eGridCol = maxInt;

    return (
        <View style={{ position: 'relative', width: gridW, height: gridH }}>
            <Svg width={gridW} height={gridH} viewBox={`0 0 ${gridW} ${gridH}`}>
                {Array.from({ length: totalRows + 1 }, (_, r) => (
                    <Line key={`h${r}`} x1={0} y1={r * CELL} x2={gridW} y2={r * CELL} stroke={GRID_COLOR} strokeWidth={0.5} />
                ))}
                {Array.from({ length: gridCols + 1 }, (_, col) => (
                    <Line key={`v${col}`} x1={col * CELL} y1={0} x2={col * CELL} y2={gridH} stroke={GRID_COLOR} strokeWidth={0.5} />
                ))}
                {scaffolding <= 2 && (
                    <>
                        <Line x1={0} y1={1 * CELL} x2={gridW} y2={1 * CELL} stroke="#cccccc" strokeWidth={1} />
                        <Line x1={0} y1={lineRow * CELL} x2={gridW} y2={lineRow * CELL} stroke="#222222" strokeWidth={2} />
                    </>
                )}
            </Svg>

            {/* Place value headers */}
            {scaffolding <= 2 && Array.from({ length: gridCols }, (_, col) => {
                const label = placeLabel(col, maxInt, dp);
                if (!label) return null;
                return (
                    <View key={`pv${col}`} style={{ position: 'absolute', left: col * CELL, top: 0, width: CELL, height: CELL, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'AzeretMono', fontSize: CELL * 0.36, color: '#999999' }}>{label}</Text>
                    </View>
                );
            })}

            {/* Operator sign */}
            {scaffolding <= 2 && <DigitOverlay col={0} row={lastOperandRow} char={ex.operator} CELL={CELL} />}

            {/* Level 1: operand digits */}
            {scaffolding <= 1 && ex.operands.map((op, opIdx) => {
                const row = firstOperandRow + opIdx;
                return getDigitCols(op, dp, maxInt)
                    .map((d, i) => <DigitOverlay key={`op${opIdx}_${i}`} col={toGridCol(d.col)} row={row} char={d.char} CELL={CELL} />);
            })}

            {/* Comma overlays for operand rows */}
            {scaffolding <= 1 && dp > 0 && Array.from({ length: numTerms }, (_, opIdx) => (
                <CommaEdgePDF key={`cop${opIdx}`} afterGridCol={eGridCol} row={firstOperandRow + opIdx} CELL={CELL} />
            ))}

            {/* Solutions: answer */}
            {scaffolding <= 1 && showSolutions &&
                getDigitCols(ex.answer, dp, maxInt)
                    .map((d, i) => <DigitOverlay key={`ans${i}`} col={toGridCol(d.col)} row={answerRow} char={d.char} CELL={CELL} color={SOL_COLOR} />)
            }
            {scaffolding <= 1 && showSolutions && dp > 0 && (
                <CommaEdgePDF afterGridCol={eGridCol} row={answerRow} CELL={CELL} />
            )}

            {/* Solutions: carry row */}
            {scaffolding <= 1 && showSolutions && ex.operator === '+' &&
                computeAddCarries(ex.operands, dp, maxInt)
                    .filter(cr => cr.col >= 0 && cr.col < maxInt + decCols)
                    .map((cr, i) => <DigitOverlay key={`carry${i}`} col={toGridCol(cr.col)} row={freeRows} char={String(cr.carry)} CELL={CELL} color={SOL_COLOR} small />)
            }
        </View>
    );
}

// ── Multiplication grid ───────────────────────────────────────────────────────

function MultiplicationGrid({ ex, CELL, dp, scaffolding, showSolutions, c }: GridBaseProps) {
    const multiplicand = ex.operands[0];
    const multiplier = Math.round(ex.operands[1]);
    const s = Math.pow(10, dp);

    const scaledMultiplicand = Math.round(multiplicand * s);
    const mulDigits = String(multiplier).split('').reverse();
    const partialProducts = mulDigits.map((d, shift) => scaledMultiplicand * Number(d) * Math.pow(10, shift));

    const answerIntLen = intLen(ex.answer);
    const maxPPLen = Math.max(...partialProducts.map(pp => pp === 0 ? 1 : String(Math.round(pp)).length));
    const maxInt = Math.max(answerIntLen, maxPPLen);
    const decCols = dp;  // no dedicated comma column
    const extraCols = c.extraCols || 0;
    const extraRows = c.extraRows || 0;

    const n = mulDigits.length;
    const multiplicandRow = 2;
    const multiplierRow = 3;
    const lineRow1 = 4;
    const ppStartRow = 5;
    const lineRow2 = ppStartRow + n;
    const answerRow = lineRow2 + 1;
    const totalRows = answerRow + 1 + extraRows;

    const gridCols = 1 + maxInt + decCols + extraCols;
    const gridW = gridCols * CELL;
    const gridH = totalRows * CELL;
    const eGridCol = maxInt;

    return (
        <View style={{ position: 'relative', width: gridW, height: gridH }}>
            <Svg width={gridW} height={gridH} viewBox={`0 0 ${gridW} ${gridH}`}>
                {Array.from({ length: totalRows + 1 }, (_, r) => (
                    <Line key={`h${r}`} x1={0} y1={r * CELL} x2={gridW} y2={r * CELL} stroke={GRID_COLOR} strokeWidth={0.5} />
                ))}
                {Array.from({ length: gridCols + 1 }, (_, col) => (
                    <Line key={`v${col}`} x1={col * CELL} y1={0} x2={col * CELL} y2={gridH} stroke={GRID_COLOR} strokeWidth={0.5} />
                ))}
                {scaffolding <= 2 && (
                    <>
                        <Line x1={0} y1={1 * CELL} x2={gridW} y2={1 * CELL} stroke="#cccccc" strokeWidth={1} />
                        <Line x1={0} y1={lineRow1 * CELL} x2={gridW} y2={lineRow1 * CELL} stroke="#222222" strokeWidth={2} />
                        <Line x1={0} y1={lineRow2 * CELL} x2={gridW} y2={lineRow2 * CELL} stroke="#222222" strokeWidth={2} />
                    </>
                )}
            </Svg>

            {/* Place value headers */}
            {scaffolding <= 2 && Array.from({ length: gridCols }, (_, col) => {
                const label = placeLabel(col, maxInt, dp);
                if (!label) return null;
                return (
                    <View key={`pv${col}`} style={{ position: 'absolute', left: col * CELL, top: 0, width: CELL, height: CELL, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'AzeretMono', fontSize: CELL * 0.36, color: '#999999' }}>{label}</Text>
                    </View>
                );
            })}

            {scaffolding <= 2 && (
                <>
                    <DigitOverlay col={0} row={multiplierRow} char="×" CELL={CELL} />
                    <DigitOverlay col={0} row={ppStartRow + n - 1} char="+" CELL={CELL} />
                </>
            )}

            {scaffolding <= 1 &&
                getDigitCols(multiplicand, dp, maxInt)
                    .map((d, i) => <DigitOverlay key={`mc${i}`} col={toGridCol(d.col)} row={multiplicandRow} char={d.char} CELL={CELL} />)
            }
            {scaffolding <= 1 && dp > 0 && (
                <CommaEdgePDF afterGridCol={eGridCol} row={multiplicandRow} CELL={CELL} />
            )}

            {scaffolding <= 1 &&
                getDigitCols(multiplier, 0, maxInt)
                    .map((d, i) => <DigitOverlay key={`ml${i}`} col={toGridCol(d.col)} row={multiplierRow} char={d.char} CELL={CELL} />)
            }
            {scaffolding <= 1 && partialProducts.map((pp, ppIdx) => {
                const row = ppStartRow + (n - 1 - ppIdx);
                return ppDigitCols(pp, maxInt).map((d, i) => (
                    <DigitOverlay key={`pp${ppIdx}_${i}`} col={toGridCol(d.col)} row={row} char={d.char} CELL={CELL} />
                ));
            })}
            {scaffolding <= 1 && showSolutions &&
                getDigitCols(ex.answer, dp, maxInt)
                    .map((d, i) => <DigitOverlay key={`ans${i}`} col={toGridCol(d.col)} row={answerRow} char={d.char} CELL={CELL} color={SOL_COLOR} />)
            }
            {scaffolding <= 1 && showSolutions && dp > 0 && (
                <CommaEdgePDF afterGridCol={eGridCol} row={answerRow} CELL={CELL} />
            )}
        </View>
    );
}

// ── Division grid ─────────────────────────────────────────────────────────────
// Dutch staartdeling: dividend left, divisor top-right (in box), quotient below horizontal line.

function DivisionGrid({ ex, CELL, dp, scaffolding, showSolutions, c }: GridBaseProps) {
    const dividend = ex.operands[0];
    const divisor = ex.operands[1];
    const quotient = ex.answer;
    const extraCols = c.extraCols || 0;
    const extraRows = c.extraRows || 0;

    const dividendIntCols = intLen(dividend);
    const divisorCols = intLen(divisor);
    const quotientIntCols = intLen(quotient);

    const workingDecCols = dp > 0 ? Math.max(dp, 3) : 0;
    const leftCols = dividendIntCols + workingDecCols;
    const rightContentCols = Math.max(divisorCols, quotientIntCols + dp);
    const rightCols = rightContentCols + 1;
    const totalCols = leftCols + rightCols + extraCols;

    const workingRows = leftCols * 2 + 1;
    const totalRows = 1 + workingRows + extraRows;

    const gridW = totalCols * CELL;
    const gridH = totalRows * CELL;

    return (
        <View style={{ position: 'relative', width: gridW, height: gridH }}>
            <Svg width={gridW} height={gridH} viewBox={`0 0 ${gridW} ${gridH}`}>
                {Array.from({ length: totalRows + 1 }, (_, r) => (
                    <Line key={`h${r}`} x1={0} y1={r * CELL} x2={gridW} y2={r * CELL} stroke={GRID_COLOR} strokeWidth={0.5} />
                ))}
                {Array.from({ length: totalCols + 1 }, (_, col) => (
                    <Line key={`v${col}`} x1={col * CELL} y1={0} x2={col * CELL} y2={gridH} stroke={GRID_COLOR} strokeWidth={0.5} />
                ))}
                {scaffolding <= 2 && (
                    <>
                        {/* Vertical separator: full height */}
                        <Line x1={leftCols * CELL} y1={0} x2={leftCols * CELL} y2={gridH} stroke="#222222" strokeWidth={2} />
                        {/* Divisor box top */}
                        <Line x1={leftCols * CELL} y1={0} x2={gridW} y2={0} stroke="#222222" strokeWidth={2} />
                        {/* Divisor box bottom = quotient separator */}
                        <Line x1={leftCols * CELL} y1={CELL} x2={gridW} y2={CELL} stroke="#222222" strokeWidth={2} />
                    </>
                )}
            </Svg>

            {/* Dividend integer digits */}
            {scaffolding <= 1 && getDigitCols(dividend, 0, dividendIntCols)
                .map((d, i) => <DigitOverlay key={`dv${i}`} col={d.col} row={0} char={d.char} CELL={CELL} />)
            }
            {/* Decimal zeros for dividend */}
            {scaffolding <= 1 && workingDecCols > 0 && Array.from({ length: dp }, (_, i) => (
                <DigitOverlay key={`dvd${i}`} col={dividendIntCols + i} row={0} char="0" CELL={CELL} />
            ))}
            {scaffolding <= 1 && workingDecCols > 0 && (
                <CommaEdgePDF afterGridCol={dividendIntCols - 1} row={0} CELL={CELL} />
            )}

            {/* Divisor digits (right section, row 0) */}
            {scaffolding <= 1 && getDigitCols(divisor, 0, divisorCols)
                .map((d, i) => <DigitOverlay key={`dr${i}`} col={leftCols + d.col} row={0} char={d.char} CELL={CELL} />)
            }

            {/* Quotient digits (right section, row 1 — below horizontal line) */}
            {scaffolding <= 1 && showSolutions && (
                getDigitCols(quotient, dp, quotientIntCols)
                    .map((d, i) => <DigitOverlay key={`qt${i}`} col={leftCols + d.col} row={1} char={d.char} CELL={CELL} color={SOL_COLOR} />)
            )}
            {scaffolding <= 1 && showSolutions && dp > 0 && (
                <CommaEdgePDF afterGridCol={leftCols + quotientIntCols - 1} row={1} CELL={CELL} />
            )}
        </View>
    );
}

// ── Exercise box ──────────────────────────────────────────────────────────────

interface ExBoxProps { ex: CijferExercise; c: CijferConstraints; showSolutions: boolean; }

function CijferExerciseBox({ ex, c, showSolutions }: ExBoxProps) {
    const CELL = c.gridCellSize || 25;
    const dp = c.numberType === 'decimal' ? (c.decimalPlaces || 2) : 0;
    const scaffolding = c.scaffolding || 3;
    const isDivision = ex.operator === ':';
    const isMultiplication = ex.operator === 'x';

    const opStr = ex.operator === 'x' ? '×' : ex.operator;
    const headerText = ex.operands.map((o, i) => fmtDisplay(o, isDivision ? 0 : (isMultiplication && i > 0) ? 0 : dp)).join(` ${opStr} `) + ' =';
    const decLabel = dp > 0 ? ` (tot op ${dp === 1 ? '0,1' : dp === 2 ? '0,01' : '0,001'})` : '';

    return (
        <View wrap={false} style={{ marginBottom: 6, alignSelf: 'flex-start' }}>
            <View style={{ borderWidth: 0.5, borderColor: '#aaaaaa', paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8, backgroundColor: '#ffffff' }}>
                <Text style={{ fontFamily: 'AzeretMono', fontSize: 11, textAlign: 'center' }}>
                    {headerText}
                </Text>
            </View>

            {c.withEstimation && (
                <View style={{ backgroundColor: '#e8e8e8', borderWidth: 0.5, borderColor: '#aaaaaa', borderTopWidth: 0, paddingTop: 3, paddingBottom: 3, paddingLeft: 8, paddingRight: 8, marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Roboto', fontSize: 9, color: '#555555' }}>
                        {showSolutions ? `≈  ${computeEstimation(ex)}` : '≈  ...................................................................................'}
                    </Text>
                </View>
            )}

            <View style={{ marginTop: 3 }}>
                {isDivision
                    ? <DivisionGrid ex={ex} c={c} CELL={CELL} dp={dp} scaffolding={scaffolding} showSolutions={showSolutions} />
                    : isMultiplication
                    ? <MultiplicationGrid ex={ex} c={c} CELL={CELL} dp={dp} scaffolding={scaffolding} showSolutions={showSolutions} />
                    : <AddSubGrid ex={ex} c={c} CELL={CELL} dp={dp} scaffolding={scaffolding} showSolutions={showSolutions} />
                }
            </View>

            {isDivision && (c.showQR !== false) && (
                <View style={{ borderWidth: 0.5, borderColor: '#aaaaaa', borderTopWidth: 0, backgroundColor: '#e8e8e8', paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8, marginTop: 2 }}>
                    {showSolutions ? (
                        <>
                            <Text style={{ fontFamily: 'AzeretMono', fontSize: 10, marginBottom: 2 }}>q  {fmtDisplay(ex.answer, dp)}</Text>
                            <Text style={{ fontFamily: 'AzeretMono', fontSize: 10 }}>r  {ex.remainder > 0 ? fmtDisplay(ex.remainder, dp) : '0'}</Text>
                        </>
                    ) : (
                        <>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 }}>
                                <Text style={{ fontFamily: 'AzeretMono', fontSize: 10 }}>q</Text>
                                <View style={{ flex: 1, borderBottomWidth: 0.75, borderBottomColor: '#555555', height: 12, marginLeft: 4 }} />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                <Text style={{ fontFamily: 'AzeretMono', fontSize: 10 }}>r</Text>
                                <View style={{ flex: 1, borderBottomWidth: 0.75, borderBottomColor: '#555555', height: 12, marginLeft: 4 }} />
                            </View>
                        </>
                    )}
                </View>
            )}
        </View>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface Props { block: MathBlock; showSolutions: boolean; }

export default function CijferPDF({ block, showSolutions }: Props) {
    const c = block.constraints as CijferConstraints;
    const exercises = (block.cijferExercises || []) as CijferExercise[];

    if (exercises.length === 0) return <View />;

    const exPerRow = computeExPerRow(c);

    const groups: CijferExercise[][] = [];
    exercises.forEach((ex, i) => {
        if (i % exPerRow === 0) groups.push([ex]);
        else groups[groups.length - 1].push(ex);
    });

    if (exPerRow === 1) {
        return (
            <View>
                {exercises.map(ex => <CijferExerciseBox key={ex.id} ex={ex} c={c} showSolutions={showSolutions} />)}
            </View>
        );
    }

    return (
        <View>
            {groups.map((group, i) => (
                <View key={i} wrap={false} style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
                    {group.map(ex => (
                        <CijferExerciseBox key={ex.id} ex={ex} c={c} showSolutions={showSolutions} />
                    ))}
                    {/* Pad last row if incomplete */}
                    {Array.from({ length: exPerRow - group.length }, (_, k) => (
                        <View key={`pad${k}`} style={{ width: estimateExWidth(c) }} />
                    ))}
                </View>
            ))}
        </View>
    );
}
