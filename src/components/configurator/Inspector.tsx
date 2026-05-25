import { useWorksheetStore } from '../../store/useWorksheetStore';
import AdditionConfig from './plugins/AdditionConfig';
import SubtractionConfig from './plugins/SubtractionConfig';
import MultiplicationConfig from './plugins/MultiplicationConfig';
import DivisionConfig from './plugins/DivisionConfig';
import ClockConfig from './plugins/ClockConfig';
import FractionConfig from './plugins/FractionConfig';
import { generateAdditionExercises, generateSubtractionExercises, generateMultiplicationExercises, generateDivisionExercises } from '../../services/math/mathEngine';
import { generateClockExercises } from '../../services/clock/clockGenerator';
import { generateFractionExercises } from '../../services/fractions/fractionGenerator';

export default function Inspector() {
    const activeBlockId = useWorksheetStore((state) => state.activeBlockId);
    const activeBlock = useWorksheetStore((state) => state.blocks.find(b => b.id === activeBlockId));

    const headerData = useWorksheetStore((state) => state.header);
    const footerData = useWorksheetStore((state) => state.footer);
    const docSettings = useWorksheetStore((state) => state.docSettings);
    const updateHeader = useWorksheetStore((state) => state.updateHeader);
    const updateFooter = useWorksheetStore((state) => state.updateFooter);
    const updateDocSettings = useWorksheetStore((state) => state.updateDocSettings);
    const setBlockExercises = useWorksheetStore((state) => state.setBlockExercises);
    const setClockExercises = useWorksheetStore((state) => state.setClockExercises);
    const setFractionExercises = useWorksheetStore((state) => state.setFractionExercises);

    const handleGenerateExercises = () => {
        if (!activeBlock) return;
        let newExercises: ReturnType<typeof generateAdditionExercises> = [];

        if (activeBlock.typeId.includes('optellen')) {
            newExercises = generateAdditionExercises(activeBlock);
        } else if (activeBlock.typeId.includes('aftrekken')) {
            newExercises = generateSubtractionExercises(activeBlock);
        } else if (activeBlock.typeId.includes('vermenigvuldigen')) {
            newExercises = generateMultiplicationExercises(activeBlock);
        } else if (activeBlock.typeId.includes('delen')) {
            newExercises = generateDivisionExercises(activeBlock);
        }

        setBlockExercises(activeBlock.id, newExercises);
    };

    const handleGenerateClockExercises = () => {
        if (!activeBlock) return;
        const newExercises = generateClockExercises(activeBlock);
        setClockExercises(activeBlock.id, newExercises);
    };

    const handleGenerateFractionExercises = () => {
        if (!activeBlock) return;
        setFractionExercises(activeBlock.id, generateFractionExercises(activeBlock));
    };

    // SCENARIO A: Document niveau geselecteerd
    if (activeBlockId === 'document') {
        return (
            <aside style={styles.sidebar}>
                <h3 style={styles.mainTitle}>Algemene Instellingen</h3>

                <div style={styles.card}>
                    <h4 style={styles.cardTitle}>Werkbundel Titel</h4>
                    <div style={styles.flexColumn}>
                        <label style={styles.label}>Titel van het document</label>
                        <input style={styles.input} value={headerData.titel || ''} onChange={(e) => updateHeader({ titel: e.target.value })} placeholder="Bv. Herhalingstoets" />
                        <div style={{ marginTop: '10px' }}>
                            <label style={styles.label}>Koptekst Stijl</label>
                            <div style={styles.btnGroup}>
                                {(['geen', 'kader'] as const).map((s) => (
                                    <button key={s} onClick={() => updateDocSettings({ headerStyle: s })} style={styles.radioBtn(docSettings.headerStyle === s)}>
                                        {s === 'geen' ? 'Geen' : 'Kader'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.card}>
                    <h4 style={styles.cardTitle}>Koptekst (Bovenaan)</h4>
                    <div style={styles.flexColumn}>
                        <label style={styles.checkboxLabel}><input type="checkbox" checked={headerData.naam} onChange={(e) => updateHeader({ naam: e.target.checked })} style={styles.checkbox} /> Naam tonen</label>
                        <label style={styles.checkboxLabel}><input type="checkbox" checked={headerData.klas} onChange={(e) => updateHeader({ klas: e.target.checked })} style={styles.checkbox} /> Klas tonen</label>
                        <label style={styles.checkboxLabel}><input type="checkbox" checked={headerData.nummer} onChange={(e) => updateHeader({ nummer: e.target.checked })} style={styles.checkbox} /> Nummer (Nr.) tonen</label>
                        <label style={styles.checkboxLabel}><input type="checkbox" checked={headerData.datum} onChange={(e) => updateHeader({ datum: e.target.checked })} style={styles.checkbox} /> Datum tonen</label>
                    </div>
                </div>

                <div style={styles.card}>
                    <h4 style={styles.cardTitle}>Voettekst (Onderaan)</h4>
                    <div style={styles.flexColumn}>
                        <label style={styles.checkboxLabel}><input type="checkbox" checked={footerData.showSchool} onChange={(e) => updateFooter({ showSchool: e.target.checked })} style={styles.checkbox} /> School tonen</label>
                        <div style={{ paddingLeft: '26px', marginBottom: '4px' }}>
                            <input style={{ ...styles.input, opacity: footerData.showSchool ? 1 : 0.4 }} disabled={!footerData.showSchool} value={footerData.school || ''} onChange={(e) => updateFooter({ school: e.target.value })} placeholder="Bv. VBS De Vlinder" />
                        </div>
                        <label style={styles.checkboxLabel}><input type="checkbox" checked={footerData.showKlas} onChange={(e) => updateFooter({ showKlas: e.target.checked })} style={styles.checkbox} /> Klas tonen</label>
                        <div style={{ paddingLeft: '26px', marginBottom: '4px' }}>
                            <input style={{ ...styles.input, opacity: footerData.showKlas ? 1 : 0.4 }} disabled={!footerData.showKlas} value={footerData.klas || ''} onChange={(e) => updateFooter({ klas: e.target.value })} placeholder="Bv. L3a" />
                        </div>
                        <label style={styles.checkboxLabel}><input type="checkbox" checked={footerData.showLeerkracht} onChange={(e) => updateFooter({ showLeerkracht: e.target.checked })} style={styles.checkbox} /> Leerkracht tonen</label>
                        <div style={{ paddingLeft: '26px', marginBottom: '4px' }}>
                            <input style={{ ...styles.input, opacity: footerData.showLeerkracht ? 1 : 0.4 }} disabled={!footerData.showLeerkracht} value={footerData.leerkracht || ''} onChange={(e) => updateFooter({ leerkracht: e.target.value })} placeholder="Bv. Meester Ruben" />
                        </div>
                        <label style={styles.checkboxLabel}><input type="checkbox" checked={footerData.showPagina} onChange={(e) => updateFooter({ showPagina: e.target.checked })} style={styles.checkbox} /> Paginanummering tonen</label>
                    </div>
                </div>

                <div style={styles.card}>
                    <h4 style={styles.cardTitle}>Weergave</h4>
                    <div style={styles.flexColumn}>
                        <label style={styles.checkboxLabel}><input type="checkbox" checked={docSettings.showScores} onChange={(e) => updateDocSettings({ showScores: e.target.checked })} style={styles.checkbox} /> Scores tonen</label>
                        <label style={styles.checkboxLabel}><input type="checkbox" checked={docSettings.showDividers} onChange={(e) => updateDocSettings({ showDividers: e.target.checked })} style={styles.checkbox} /> Scheidingslijnen tonen</label>
                        <div style={{ marginTop: '8px' }}>
                            <label style={styles.label}>Opdracht Titel Stijl</label>
                            <div style={styles.btnGroup}>
                                {(['regular', 'boxed', 'underlined'] as const).map((s) => (
                                    <button key={s} onClick={() => updateDocSettings({ opdrachtTitelStyle: s })} style={styles.radioBtn(docSettings.opdrachtTitelStyle === s)}>
                                        {s === 'regular' ? 'Normaal' : s === 'boxed' ? 'Kader' : 'Onderstreept'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                            <label style={styles.label}>Titel Positie</label>
                            <div style={styles.btnGroup}>
                                {(['center', 'right'] as const).map((p) => (
                                    <button key={p} onClick={() => updateDocSettings({ titlePosition: p })} style={styles.radioBtn((docSettings.titlePosition ?? 'center') === p)}>
                                        {p === 'center' ? 'Gecentreerd' : 'Rechts'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        );
    }

    // SCENARIO B: Helemaal niets geselecteerd
    if (!activeBlock) {
        return (
            <aside style={{ ...styles.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>Selecteer een oefening of het document.</p>
            </aside>
        );
    }

    // SCENARIO C: Klokblok geselecteerd
    if (activeBlock.typeId.startsWith('klok-')) {
        return (
            <aside style={styles.sidebar}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Klokinstellingen</h3>
                    <ClockConfig block={activeBlock} />
                    <button onClick={handleGenerateClockExercises} style={styles.generateBtn}>✨ Genereer oefeningen</button>
                </div>
            </aside>
        );
    }

    // SCENARIO D: Breukblok geselecteerd
    if (activeBlock.typeId === 'breuken') {
        return (
            <aside style={styles.sidebar}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Breuken Instellingen</h3>
                    <FractionConfig block={activeBlock} />
                    <button onClick={handleGenerateFractionExercises} style={styles.generateBtn}>✨ Genereer oefeningen</button>
                </div>
            </aside>
        );
    }

    // SCENARIO E: Wiskundeblok geselecteerd
    return (
        <aside style={styles.sidebar}>
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Wiskunde Engine</h3>

                {activeBlock.typeId.includes('optellen') && <AdditionConfig block={activeBlock} />}
                {activeBlock.typeId.includes('aftrekken') && <SubtractionConfig block={activeBlock} />}
                {activeBlock.typeId.includes('vermenigvuldigen') && <MultiplicationConfig block={activeBlock} />}
                {activeBlock.typeId.includes('delen') && <DivisionConfig block={activeBlock} />}

                <button onClick={handleGenerateExercises} style={styles.generateBtn}>✨ Genereer oefeningen</button>
            </div>
        </aside>
    );
}

// ============================================================================
// LOKALE STYLES
// ============================================================================
const styles = {
    sidebar: { width: '425px', minWidth: '425px', backgroundColor: 'var(--bg-dark)', borderLeft: '1px solid var(--border-color)', height: '100%', boxSizing: 'border-box', overflowY: 'auto', padding: '20px' } as React.CSSProperties,
    mainTitle: { color: 'var(--text-main)', marginTop: 0, marginBottom: '24px', fontSize: '18px' } as React.CSSProperties,
    card: { backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' } as React.CSSProperties,
    cardTitle: { color: 'var(--accent-purple)', margin: '0 0 16px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' } as React.CSSProperties,
    label: { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' } as React.CSSProperties,
    input: { width: '100%', padding: '10px', backgroundColor: '#1a1a1f', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', outline: 'none', boxSizing: 'border-box', fontSize: '13px' } as React.CSSProperties,
    flexColumn: { display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-main)', marginBottom: '8px' } as React.CSSProperties,
    checkbox: { accentColor: 'var(--accent-purple)', width: '16px', height: '16px', cursor: 'pointer' } as React.CSSProperties,
    generateBtn: { width: '100%', padding: '14px', backgroundColor: 'var(--accent-purple)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s', marginTop: '16px', boxShadow: '0 4px 12px rgba(155, 48, 255, 0.3)' } as React.CSSProperties,
    btnGroup: { display: 'flex', gap: '4px', backgroundColor: '#1a1a1f', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)' } as React.CSSProperties,
    radioBtn: (active: boolean): React.CSSProperties => ({ padding: '6px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: active ? 'var(--accent-purple)' : 'transparent', color: active ? 'white' : 'var(--text-muted)', fontWeight: active ? 'bold' : 'normal', flex: 1 }),
};
