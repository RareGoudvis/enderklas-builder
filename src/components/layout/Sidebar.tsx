import logo from '../../assets/enderklas-logo.png';
import { APP_STRUCTURE } from '../../config/appstructure';
import { useWorksheetStore } from '../../store/useWorksheetStore';

interface Props {
    onOpenSettings: () => void;
    onDownloadPDF: (withSolutions: boolean) => void;
    isGenerating: boolean;
}

export default function Sidebar({ onOpenSettings, onDownloadPDF, isGenerating }: Props) {
    const addBlockFromType = useWorksheetStore((state) => state.addBlockFromType);

    return (
        <aside style={S.aside}>

            {/* Branding */}
            <div style={S.header}>
                <div style={S.logoWrap}>
                    <img src={logo} alt="Enderklas Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h2 style={S.title}>Enderklas Builder</h2>
                <p style={S.subtitle}>Basisonderwijs Vlaanderen</p>
            </div>

            <hr style={S.divider} />

            {/* Navigation tree */}
            <div style={S.navArea}>
                {APP_STRUCTURE.map((domain) => {
                    const accent = `var(${domain.accentVar})`;
                    return (
                        <div key={domain.id} style={{ marginBottom: '24px' }}>
                            <h3 style={{ ...S.domainLabel, color: accent }}>{domain.label}</h3>
                            <div style={{ borderLeft: `2px solid ${accent}`, paddingLeft: '12px' }}>
                                {domain.subdomains.map((subdomain) => (
                                    <div key={subdomain.id} style={{ marginBottom: '10px' }}>
                                        {subdomain.directAdd ? (
                                            <button
                                                onClick={() => addBlockFromType(subdomain.directAdd!, subdomain.label)}
                                                style={S.itemBtn}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                            >
                                                <span style={S.addIcon}>+</span> {subdomain.label}
                                            </button>
                                        ) : (
                                            <>
                                                <h4 style={S.subdomainLabel}>{subdomain.label}</h4>
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {subdomain.types.map((type) => (
                                                        <li key={type.id}>
                                                            <button
                                                                onClick={() => addBlockFromType(type.id, type.label)}
                                                                style={S.itemBtn}
                                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                                            >
                                                                <span style={S.addIcon}>+</span> {type.label}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {subdomain.types.length === 0 && (
                                                    <p style={S.comingSoon}>binnenkort beschikbaar</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer actions */}
            <div style={S.footer}>
                <button onClick={onOpenSettings} style={S.settingsBtn}>
                    Algemene Instellingen
                </button>
                <button onClick={() => onDownloadPDF(false)} style={S.downloadBtn} disabled={isGenerating}>
                    {isGenerating ? '⏳ PDF genereren...' : 'Download oefenbundel'}
                </button>
                <button onClick={() => onDownloadPDF(true)} style={S.downloadSolBtn} disabled={isGenerating}>
                    {isGenerating ? '⏳ PDF genereren...' : 'Download oplossingen'}
                </button>
            </div>
        </aside>
    );
}

const S = {
    addIcon: { fontWeight: '700', fontSize: '15px', marginTop: '-3px' },
    aside: { width: '280px', minWidth: '280px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' } as React.CSSProperties,
    header: { padding: '24px 20px 16px 20px' } as React.CSSProperties,
    logoWrap: { width: '100%', height: '75px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', padding: '5px', overflow: 'hidden' } as React.CSSProperties,
    title: { margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: 700 } as React.CSSProperties,
    subtitle: { margin: '4px 0 0 0', fontSize: '13px', color: 'var(--accent-purple)', fontWeight: 400 } as React.CSSProperties,
    divider: { border: 'none', height: '1px', backgroundColor: 'var(--border-color)', margin: '0 20px' } as React.CSSProperties,
    navArea: { flex: 1, overflowY: 'auto', padding: '20px' } as React.CSSProperties,
    domainLabel: { fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0', fontWeight: 700 } as React.CSSProperties,
    subdomainLabel: { fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' } as React.CSSProperties,
    itemBtn: { width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s ease' } as React.CSSProperties,
    comingSoon: { fontSize: '11px', color: 'var(--border-color)', margin: '2px 0 0 6px', fontStyle: 'italic' } as React.CSSProperties,
    footer: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' } as React.CSSProperties,
    settingsBtn: { width: '100%', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)' } as React.CSSProperties,
    downloadBtn: { width: '100%', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', border: 'none', backgroundColor: 'var(--accent-purple)', color: '#ffffff' } as React.CSSProperties,
    downloadSolBtn: { width: '100%', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', border: 'none', backgroundColor: 'var(--accent-purple-dark)', color: '#ffffff' } as React.CSSProperties,
};
