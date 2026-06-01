import { useState } from 'react';
import type { MathBlock, HerleidingExercise, HerleidingPart } from '../../services/math/types';
import { formatMathNumber } from '../../services/math/formatters';
import { ladderFor, recomputeHerleiding } from '../../services/herleidingen/herleidingenGenerator';
import { useWorksheetStore } from '../../store/useWorksheetStore';
import FragmentableGrid from './FragmentableGrid';

interface Props { block: MathBlock; showSolutions: boolean; }

const mono = "'Azeret Mono', monospace";
const SOL = '#e11d48';
const SALMON = '#f4cbb8';

const numLine = () => <span style={{ borderBottom: '1.5px solid #000', minWidth: '60px', height: '16px', display: 'inline-block' }} />;
const unitLine = () => <span style={{ borderBottom: '1.5px solid #000', minWidth: '34px', height: '16px', display: 'inline-block' }} />;

// Click a given number → inline input; click a given unit → dropdown of valid ladder units.
function EditableNumber({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState('');
    if (editing) {
        return (
            <input autoFocus value={text}
                onClick={e => e.stopPropagation()}
                onChange={e => setText(e.target.value)}
                onBlur={() => { const n = Number(text.replace(',', '.')); if (!isNaN(n)) onCommit(n); setEditing(false); }}
                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditing(false); }}
                style={{ width: '70px', fontFamily: mono, fontSize: '16px', border: '1px solid var(--accent)', borderRadius: '4px', padding: '0 4px' }} />
        );
    }
    return <span onClick={e => { e.stopPropagation(); setText(String(value)); setEditing(true); }} style={{ cursor: 'text' }} title="Klik om aan te passen">{formatMathNumber(value)}</span>;
}

function EditableUnit({ value, measure, onCommit }: { value: string; measure: string; onCommit: (v: string) => void }) {
    const [editing, setEditing] = useState(false);
    if (editing) {
        return (
            <select autoFocus defaultValue={value}
                onClick={e => e.stopPropagation()}
                onChange={e => { onCommit(e.target.value); setEditing(false); }}
                onBlur={() => setEditing(false)}
                style={{ fontFamily: mono, fontSize: '15px', border: '1px solid var(--accent)', borderRadius: '4px' }}>
                {ladderFor(measure).map(u => <option key={u.key} value={u.key}>{u.key}</option>)}
            </select>
        );
    }
    return <span onClick={e => { e.stopPropagation(); setEditing(true); }} style={{ cursor: 'pointer' }} title="Klik om de eenheid te kiezen">{value}</span>;
}

export default function HerleidingenViewer({ block, showSolutions }: Props) {
    const patchExercise = useWorksheetStore(s => s.patchExercise);
    const exercises: HerleidingExercise[] = block.herleidingExercises || [];
    const measure: string = block.constraints.measure ?? 'lengte';
    const scaffolding: string = block.constraints.scaffolding ?? 'geen';
    const writeUnits: boolean = !!block.constraints.writeUnits;
    const gap = block.verticalSpacing || 14;

    if (exercises.length === 0) {
        return <div className="no-print" style={{ padding: '8px 0', fontStyle: 'italic', color: '#999', fontSize: '14px' }}>(Genereer oefeningen via het rechterpaneel)</div>;
    }

    // Recompute the answer and persist after any teacher edit to a shown field.
    const commit = (ex: HerleidingExercise, edited: HerleidingExercise) => {
        const re = recomputeHerleiding(measure, edited);
        patchExercise(block.id, 'herleidingExercises', ex.id, { fromParts: re.fromParts, toParts: re.toParts, isManuallyEdited: true });
    };
    const editFrom = (ex: HerleidingExercise, i: number, patch: Partial<HerleidingPart>) =>
        commit(ex, { ...ex, fromParts: ex.fromParts.map((p, idx) => idx === i ? { ...p, ...patch } : p) });
    const editTo = (ex: HerleidingExercise, i: number, patch: Partial<HerleidingPart>) =>
        commit(ex, { ...ex, toParts: ex.toParts.map((p, idx) => idx === i ? { ...p, ...patch } : p) });

    const renderFrom = (ex: HerleidingExercise) => ex.fromParts.map((p, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px', marginLeft: i > 0 ? '8px' : 0 }}>
            <EditableNumber value={p.value} onCommit={v => editFrom(ex, i, { value: v })} />
            <EditableUnit value={p.key} measure={measure} onCommit={k => editFrom(ex, i, { key: k })} />
        </span>
    ));

    const renderTo = (ex: HerleidingExercise) => ex.toParts.map((p, i) => {
        const numBlank = ex.blank === 'number';
        const unitBlank = ex.blank === 'unit' || (writeUnits && ex.blank === 'number');
        return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '5px' }}>
                {numBlank
                    ? (showSolutions ? <span style={{ color: SOL }}>{formatMathNumber(p.value)}</span> : numLine())
                    : <EditableNumber value={p.value} onCommit={v => editTo(ex, i, { value: v })} />}
                {unitBlank
                    ? (showSolutions ? <span style={{ color: SOL }}>{p.key}</span> : unitLine())
                    : <EditableUnit value={p.key} measure={measure} onCommit={k => editTo(ex, i, { key: k })} />}
            </span>
        );
    });

    const exerciseGrid = (
        <FragmentableGrid
            cols={2}
            columnGap={28}
            rowGap={gap + 2}
            items={exercises.map(ex => (
                <div key={ex.id} className="print-exercise" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', fontFamily: mono, fontSize: '16px' }}>
                    <span style={{ display: 'inline-block', width: '150px', textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>{renderFrom(ex)}</span>
                    <span>=</span>
                    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '10px' }}>{renderTo(ex)}</span>
                </div>
            ))}
        />
    );

    // Conversion-table scaffold ABOVE the exercises (one blank row per exercise). "tabel-blanco"
    // leaves the header cells empty so the pupil writes the units.
    let table = null;
    if (scaffolding === 'tabel-headers' || scaffolding === 'tabel-blanco') {
        const units = ladderFor(measure).filter(u => (block.constraints.units ?? []).includes(u.key));
        const cols = units.map(() => '60px').join(' ');
        const cell: React.CSSProperties = { border: '1px solid #000', height: '30px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: '13px' };
        const showHeaders = scaffolding === 'tabel-headers';
        table = (
            <div style={{ marginBottom: `${gap + 6}px`, width: 'fit-content' }}>
                <div className="print-row" style={{ display: 'grid', gridTemplateColumns: cols }}>
                    {units.map(u => <div key={u.key} style={{ ...cell, backgroundColor: SALMON, fontWeight: 'bold' }}>{showHeaders ? u.key : ''}</div>)}
                </div>
                {exercises.map(ex => (
                    <div key={ex.id} className="print-row" style={{ display: 'grid', gridTemplateColumns: cols }}>
                        {units.map(u => <div key={u.key} style={cell} />)}
                    </div>
                ))}
            </div>
        );
    }

    return <div>{table}{exerciseGrid}</div>;
}
