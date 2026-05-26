import React from 'react';
import { View, Text, Svg, Path, Line } from '@react-pdf/renderer';
import type { MathBlock, SplitsenExercise } from '../../../services/math/types';

const LEFT_HALF    = 'M50 80 C8 55 5 15 27 15 A23 23 0 0 1 50 36 L50 80Z';
const RIGHT_HALF   = 'M50 36 A23 23 0 0 1 73 15 C95 15 92 55 50 80 L50 36Z';
const HEART_OUTLINE = 'M50 80 C8 55 5 15 27 15 A23 23 0 0 1 50 36 A23 23 0 0 1 73 15 C95 15 92 55 50 80Z';
const SOL_COLOR = '#e11d48';

const fmt = (n: number): string =>
    String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

interface Props {
    block: MathBlock;
    showSolutions: boolean;
}

export default function SplitsenPDF({ block, showSolutions }: Props) {
    const layout: string = block.constraints.layout || 'basic';
    const exercises: SplitsenExercise[] = block.splitsenExercises || [];
    const spacing = block.verticalSpacing || 14;
    const rowHeight: number = block.constraints.rowHeight || 28;

    if (exercises.length === 0) return <View />;

    if (layout === 'basic') {
        const cols = Math.min(exercises.length, 4);
        const pct = `${Math.floor(100 / cols)}%`;
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing }}>
                {exercises.map(ex => (
                    <View key={ex.id} style={{ width: pct, flexShrink: 0 }}>
                        <BasicBoxPDF ex={ex} showSolutions={showSolutions} rowHeight={rowHeight} />
                    </View>
                ))}
            </View>
        );
    }

    if (layout === 'mathematic') {
        const allItems = exercises.flatMap(ex =>
            ex.pairs.map((p, i) => ({ ...p, total: ex.total, uid: `${ex.id}-${i}` }))
        );
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {allItems.map((item) => (
                    <View key={item.uid} style={{ width: '50%', marginBottom: spacing }}>
                        <MathRowPDF total={item.total} given={item.given} answer={item.answer} showSolutions={showSolutions} />
                    </View>
                ))}
            </View>
        );
    }

    if (layout === 'verliefde-harten') {
        const allItems = exercises.flatMap(ex =>
            ex.pairs.map((p, i) => ({ ...p, total: ex.total, uid: `${ex.id}-${i}` }))
        );
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' }}>
                {allItems.map((item) => (
                    <HeartPDF key={item.uid} total={item.total} given={item.given} answer={item.answer} showSolutions={showSolutions} />
                ))}
            </View>
        );
    }

    return <View />;
}

// ── Basic box ─────────────────────────────────────────────────────────────────

function BasicBoxPDF({ ex, showSolutions, rowHeight }: { ex: SplitsenExercise; showSolutions: boolean; rowHeight: number }) {
    return (
        <View style={{ borderWidth: 1, borderColor: '#000', width: '100%' }}>
            {/* Total */}
            <View style={{ height: rowHeight, borderBottomWidth: 1, borderBottomColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'AzeretMono', fontSize: 11, fontWeight: 'bold' }}>{fmt(ex.total)}</Text>
            </View>
            {/* Pairs */}
            {ex.pairs.map((pair, i) => (
                <View key={i} style={{ flexDirection: 'row', borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#000' }}>
                    <View style={{ flex: 1, height: rowHeight, borderRightWidth: 1, borderRightColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'AzeretMono', fontSize: 11 }}>{fmt(pair.given)}</Text>
                    </View>
                    <View style={{ flex: 1, height: rowHeight, alignItems: 'center', justifyContent: 'center' }}>
                        {showSolutions && (
                            <Text style={{ fontFamily: 'AzeretMono', fontSize: 11, fontWeight: 'bold', color: SOL_COLOR }}>{fmt(pair.answer)}</Text>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
}

// ── Mathematic row ────────────────────────────────────────────────────────────

function MathRowPDF({ total, given, answer, showSolutions }: {
    total: number; given: number; answer: number; showSolutions: boolean;
}) {
    const col = (w: number, right: boolean, children: React.ReactNode) => (
        <View style={{ width: w, alignItems: right ? 'flex-end' : 'flex-start', justifyContent: 'flex-end' }}>
            {children}
        </View>
    );
    const op = (sym: string) => (
        <View style={{ width: 18, alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={{ fontFamily: 'AzeretMono', fontSize: 11 }}>{sym}</Text>
        </View>
    );

    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 28 }}>
            {col(48, true, <Text style={{ fontFamily: 'AzeretMono', fontSize: 11, fontWeight: 'bold' }}>{fmt(total)}</Text>)}
            {op('=')}
            {col(48, true, <Text style={{ fontFamily: 'AzeretMono', fontSize: 11 }}>{fmt(given)}</Text>)}
            {op('+')}
            {showSolutions
                ? col(48, false, <Text style={{ fontFamily: 'AzeretMono', fontSize: 11, fontWeight: 'bold', color: SOL_COLOR }}>{fmt(answer)}</Text>)
                : col(48, false, <View style={{ borderBottomWidth: 1.5, width: 40, height: 2 }} />)
            }
        </View>
    );
}

// ── Verliefde harten ──────────────────────────────────────────────────────────

function HeartPDF({ total, given, answer, showSolutions }: {
    total: number; given: number; answer: number; showSolutions: boolean;
}) {
    const W = 82;
    const H = Math.round(W * 0.95); // preserve heart aspect ratio (viewBox 100×95)

    return (
        <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'AzeretMono', fontSize: 10, fontWeight: 'bold', marginBottom: -10 }}>{fmt(total)}</Text>
            <View style={{ position: 'relative', width: W, height: H }}>
                <Svg width={W} height={H} viewBox="0 0 100 95">
                    <Path d={LEFT_HALF} fill="#bfdbfe" />
                    <Path d={RIGHT_HALF} fill={showSolutions ? '#fecaca' : 'white'} />
                    <Path d={HEART_OUTLINE} fill="none" stroke="black" strokeWidth={1.5} />
                    <Line x1={50} y1={36} x2={50} y2={78} stroke="black" strokeWidth={1.5} />
                </Svg>
                {/* Numbers centered at ~43% of height (heart visual centroid) */}
                <View style={{ position: 'absolute', top: 0, left: 0, width: W, height: H }}>
                    <View style={{ position: 'absolute', top: H * 0.38, left: W * 0.04 + 3, width: W * 0.48, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'AzeretMono', fontSize: 11, fontWeight: 'bold', color: '#000' }}>{fmt(given)}</Text>
                    </View>
                    {showSolutions && (
                        <View style={{ position: 'absolute', top: H * 0.38, right: W * 0.04 + 3, width: W * 0.48, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'AzeretMono', fontSize: 11, fontWeight: 'bold', color: SOL_COLOR }}>{fmt(answer)}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
