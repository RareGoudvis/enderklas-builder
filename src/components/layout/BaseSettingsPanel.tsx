import { useState } from 'react';
import { SlidersHorizontal, BookLock } from 'lucide-react';
import BaseSettingsModal from './BaseSettingsModal';
import CurriculumBuilderModal from '../curriculum/CurriculumBuilderModal';

// Sidebar "Geavanceerd" accordion: collapsed by default, opens two buttons for the
// global base-settings modal and the curriculum builder. Hidden in locked (parent)
// mode by the sidebar.
export default function BaseSettingsPanel() {
    const [open, setOpen] = useState(false);
    const [baseOpen, setBaseOpen] = useState(false);
    const [curriculumOpen, setCurriculumOpen] = useState(false);

    return (
        <div style={S.wrap}>
            <button style={S.header} onClick={() => setOpen(!open)}>
                <span style={S.groupLabel}>Geavanceerd</span>
                <span style={S.chevron(open)}>›</span>
            </button>

            {open && (
                <div style={S.body}>
                    <button style={S.btn} onClick={() => setBaseOpen(true)}>
                        <SlidersHorizontal size={14} /> Basisinstellingen
                    </button>
                    <button style={S.btn} onClick={() => setCurriculumOpen(true)}>
                        <BookLock size={14} /> Curriculum samenstellen
                    </button>
                </div>
            )}

            {baseOpen && <BaseSettingsModal onClose={() => setBaseOpen(false)} />}
            {curriculumOpen && <CurriculumBuilderModal onClose={() => setCurriculumOpen(false)} />}
        </div>
    );
}

const S = {
    wrap: { padding: '10px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '2px 0', border: 'none', background: 'none', cursor: 'pointer' } as React.CSSProperties,
    chevron: (open: boolean): React.CSSProperties => ({ fontSize: '16px', lineHeight: 1, color: 'var(--text-muted)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block' }),
    body: { display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    groupLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, color: 'var(--text-muted)' } as React.CSSProperties,
    btn: {
        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
        padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
        border: '1px solid var(--border-color)', background: 'var(--bg-input)',
        color: 'var(--text-main)', fontSize: '12px', fontWeight: 600, textAlign: 'left',
    } as React.CSSProperties,
};
