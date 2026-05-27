import type { MabStyle } from '../../services/math/types';

interface Props {
    thousands: number;
    hundreds: number;
    tens: number;
    units: number;
    style: MabStyle;
    color?: string;
    maxBoxWidth?: number;
    maxBoxHeight?: number;
}

// Renders place-value blocks for one MAB exercise. Two visual conventions:
//
//   symbolic:  units = dot, tens = vertical bar, hundreds = small outlined square,
//              thousands = stacked-square stamp. Compact / textbook abbreviation.
//   realistic: Dienes blocks — units = 1x1 cube, tens = 1x10 rod, hundreds = 10x10
//              flat, thousands = 10x10x10 cube (drawn as flat with hatching).
//
// Layout inside the SVG box: each place-value group occupies its own row, top→bottom
// = thousands → hundreds → tens → units. Within a row, like blocks cluster left-to-right.
export default function MabBlocksSVG({
    thousands, hundreds, tens, units,
    style, color = '#000',
    maxBoxWidth = 180,
    maxBoxHeight = 120,
}: Props) {
    return style === 'symbolic'
        ? <Symbolic thousands={thousands} hundreds={hundreds} tens={tens} units={units} color={color} W={maxBoxWidth} H={maxBoxHeight} />
        : <Realistic thousands={thousands} hundreds={hundreds} tens={tens} units={units} color={color} W={maxBoxWidth} H={maxBoxHeight} />;
}

// ── Symbolic style ────────────────────────────────────────────────────────────

function Symbolic({ thousands, hundreds, tens, units, color, W, H }: {
    thousands: number; hundreds: number; tens: number; units: number;
    color: string; W: number; H: number;
}) {
    const SQ = 10;   // hundred = small outlined square edge
    const BAR_W = 3, BAR_H = 22;  // ten = vertical bar
    const DOT_R = 2.5;            // unit = filled dot
    const GAP_X = 4;
    const ROW_GAP = 8;

    const rows: React.ReactNode[] = [];
    const cy = (rowIndex: number, rowHeights: number[]) =>
        rowHeights.slice(0, rowIndex).reduce((s, h) => s + h + ROW_GAP, 0);

    const layout: Array<{ key: string; render: (xOffset: number) => React.ReactNode; height: number; width: number }> = [];

    if (thousands > 0) {
        // Thousands: small stamp = 2x2 squares (visual abbreviation since paper space limited).
        const stampSize = SQ * 2 + 2;
        layout.push({
            key: 'th',
            height: stampSize,
            width: thousands * (stampSize + GAP_X),
            render: (xOff) => (
                <>
                    {Array.from({ length: thousands }).map((_, i) => {
                        const x0 = xOff + i * (stampSize + GAP_X);
                        return (
                            <g key={i}>
                                <rect x={x0} y={0} width={SQ} height={SQ} stroke={color} strokeWidth={1} fill="none" />
                                <rect x={x0 + SQ + 2} y={0} width={SQ} height={SQ} stroke={color} strokeWidth={1} fill="none" />
                                <rect x={x0} y={SQ + 2} width={SQ} height={SQ} stroke={color} strokeWidth={1} fill="none" />
                                <rect x={x0 + SQ + 2} y={SQ + 2} width={SQ} height={SQ} stroke={color} strokeWidth={1} fill="none" />
                            </g>
                        );
                    })}
                </>
            ),
        });
    }

    if (hundreds > 0) {
        layout.push({
            key: 'h',
            height: SQ,
            width: hundreds * (SQ + GAP_X),
            render: (xOff) => (
                <>
                    {Array.from({ length: hundreds }).map((_, i) => (
                        <rect key={i} x={xOff + i * (SQ + GAP_X)} y={0} width={SQ} height={SQ} stroke={color} strokeWidth={1} fill="none" />
                    ))}
                </>
            ),
        });
    }

    if (tens > 0) {
        layout.push({
            key: 't',
            height: BAR_H,
            width: tens * (BAR_W + GAP_X),
            render: (xOff) => (
                <>
                    {Array.from({ length: tens }).map((_, i) => (
                        <rect key={i} x={xOff + i * (BAR_W + GAP_X)} y={0} width={BAR_W} height={BAR_H} fill={color} />
                    ))}
                </>
            ),
        });
    }

    if (units > 0) {
        layout.push({
            key: 'e',
            height: DOT_R * 2,
            width: units * (DOT_R * 2 + GAP_X),
            render: (xOff) => (
                <>
                    {Array.from({ length: units }).map((_, i) => (
                        <circle key={i} cx={xOff + i * (DOT_R * 2 + GAP_X) + DOT_R} cy={DOT_R} r={DOT_R} fill={color} />
                    ))}
                </>
            ),
        });
    }

    const totalH = layout.reduce((s, r, i) => s + r.height + (i > 0 ? ROW_GAP : 0), 0);
    const startY = (H - totalH) / 2;

    layout.forEach((row, i) => {
        const heights = layout.map(r => r.height);
        const y = startY + cy(i, heights);
        // Center each row horizontally.
        const xOff = (W - row.width + GAP_X) / 2;
        rows.push(
            <g key={row.key} transform={`translate(0, ${y})`}>
                {row.render(xOff)}
            </g>
        );
    });

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            {rows}
        </svg>
    );
}

// ── Realistic Dienes style ────────────────────────────────────────────────────

function Realistic({ thousands, hundreds, tens, units, color, W, H }: {
    thousands: number; hundreds: number; tens: number; units: number;
    color: string; W: number; H: number;
}) {
    const CELL = 4;  // unit cell edge in px
    const STROKE = 0.5;
    const ROW_GAP = 6;

    const unitsW = units * (CELL + 2);
    const hundredsW = hundreds * (CELL * 10 + 4);
    const thousandsW = thousands * (CELL * 10 + 6);

    const rows: Array<{ key: string; w: number; h: number; render: (x: number) => React.ReactNode }> = [];

    if (thousands > 0) {
        // Cube drawn as front face = 10x10 grid + offset back face indication.
        const cubeSize = CELL * 10;
        rows.push({
            key: 'th', w: thousandsW, h: cubeSize + 6,
            render: (xOff) => (
                <>
                    {Array.from({ length: thousands }).map((_, i) => {
                        const x = xOff + i * (cubeSize + 6);
                        return (
                            <g key={i}>
                                {/* back face offset */}
                                <rect x={x + 4} y={-4} width={cubeSize} height={cubeSize} fill="none" stroke={color} strokeWidth={STROKE} />
                                <line x1={x} y1={0} x2={x + 4} y2={-4} stroke={color} strokeWidth={STROKE} />
                                <line x1={x + cubeSize} y1={0} x2={x + cubeSize + 4} y2={-4} stroke={color} strokeWidth={STROKE} />
                                <line x1={x + cubeSize} y1={cubeSize} x2={x + cubeSize + 4} y2={cubeSize - 4} stroke={color} strokeWidth={STROKE} />
                                {/* front face 10x10 grid */}
                                <rect x={x} y={0} width={cubeSize} height={cubeSize} fill="white" stroke={color} strokeWidth={STROKE} />
                                {Array.from({ length: 9 }).map((_, j) => (
                                    <g key={j}>
                                        <line x1={x + (j + 1) * CELL} y1={0} x2={x + (j + 1) * CELL} y2={cubeSize} stroke={color} strokeWidth={STROKE} />
                                        <line x1={x} y1={(j + 1) * CELL} x2={x + cubeSize} y2={(j + 1) * CELL} stroke={color} strokeWidth={STROKE} />
                                    </g>
                                ))}
                            </g>
                        );
                    })}
                </>
            ),
        });
    }

    if (hundreds > 0) {
        const flatSize = CELL * 10;
        rows.push({
            key: 'h', w: hundredsW, h: flatSize,
            render: (xOff) => (
                <>
                    {Array.from({ length: hundreds }).map((_, i) => {
                        const x = xOff + i * (flatSize + 4);
                        return (
                            <g key={i}>
                                <rect x={x} y={0} width={flatSize} height={flatSize} fill="white" stroke={color} strokeWidth={STROKE} />
                                {Array.from({ length: 9 }).map((_, j) => (
                                    <g key={j}>
                                        <line x1={x + (j + 1) * CELL} y1={0} x2={x + (j + 1) * CELL} y2={flatSize} stroke={color} strokeWidth={STROKE} />
                                        <line x1={x} y1={(j + 1) * CELL} x2={x + flatSize} y2={(j + 1) * CELL} stroke={color} strokeWidth={STROKE} />
                                    </g>
                                ))}
                            </g>
                        );
                    })}
                </>
            ),
        });
    }

    if (tens > 0) {
        const rodLen = CELL * 10;
        rows.push({
            key: 't', w: tens * (CELL + 2), h: rodLen,
            render: (xOff) => (
                <>
                    {Array.from({ length: tens }).map((_, i) => {
                        const x = xOff + i * (CELL + 2);
                        return (
                            <g key={i}>
                                <rect x={x} y={0} width={CELL} height={rodLen} fill="white" stroke={color} strokeWidth={STROKE} />
                                {Array.from({ length: 9 }).map((_, j) => (
                                    <line key={j} x1={x} y1={(j + 1) * CELL} x2={x + CELL} y2={(j + 1) * CELL} stroke={color} strokeWidth={STROKE} />
                                ))}
                            </g>
                        );
                    })}
                </>
            ),
        });
    }

    if (units > 0) {
        rows.push({
            key: 'e', w: unitsW, h: CELL,
            render: (xOff) => (
                <>
                    {Array.from({ length: units }).map((_, i) => (
                        <rect key={i} x={xOff + i * (CELL + 2)} y={0} width={CELL} height={CELL} fill="white" stroke={color} strokeWidth={STROKE} />
                    ))}
                </>
            ),
        });
    }

    const totalH = rows.reduce((s, r, i) => s + r.h + (i > 0 ? ROW_GAP : 0), 0);
    let y = (H - totalH) / 2;

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            {rows.map(row => {
                const xOff = (W - row.w) / 2;
                const node = (
                    <g key={row.key} transform={`translate(0, ${y})`}>
                        {row.render(xOff)}
                    </g>
                );
                y += row.h + ROW_GAP;
                return node;
            })}
        </svg>
    );
}
