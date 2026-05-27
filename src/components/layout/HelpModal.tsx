import { useEffect } from 'react';

interface Props {
    onClose: () => void;
}

// Sectional usage guide. Reuses theme CSS variables so it follows the
// active theme (dark/light/colorblind) automatically.
export default function HelpModal({ onClose }: Props) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            className="no-print"
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)',
                    borderRadius: '12px', padding: '28px 32px', maxWidth: '620px', width: '90%',
                    maxHeight: '85vh', overflowY: 'auto', fontFamily: "'Azeret Mono', monospace",
                    color: 'var(--text-main)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <h2 style={{ color: 'var(--accent-purple)', margin: 0, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Hulp
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            fontSize: '20px', cursor: 'pointer', padding: '4px 8px',
                        }}
                        title="Sluiten (Esc)"
                    >×</button>
                </div>

                <Section title="1. Oefeningen toevoegen">
                    Klik in de linker zijbalk op een leerdomein, daarna op een onderdeel, en uiteindelijk op het type oefening dat je wil toevoegen. Het verschijnt onmiddellijk op het werkblad in het midden.
                </Section>

                <Section title="2. Configureren en genereren">
                    Klik op een blok om het rechterpaneel te openen. Stel de parameters in (aantal oefeningen, moeilijkheidsgraad, masker, …) en klik op <strong>Genereer</strong> om oefeningen te maken. <strong>Genereer alles</strong> bovenaan vernieuwt alle blokken in één klik.
                </Section>

                <Section title="3. Blokken vergrendelen">
                    Klik op het 🔓 / 🔒 slot-icoontje bij een actief blok om het te vergrendelen. Vergrendelde blokken worden overgeslagen bij <strong>Genereer alles</strong> — handig voor blokken die je handmatig aangepast hebt.
                </Section>

                <Section title="4. Opslaan en openen">
                    Met <strong>Exporteer</strong> download je het volledige werkblad (alle blokken + instellingen) als JSON-bestand. Met <strong>Importeer</strong> laad je een eerder opgeslagen werkbundel terug in. Het huidige werkblad wordt daarbij vervangen.
                </Section>

                <Section title="5. Afdrukken">
                    Druk op <strong>Print</strong> in de bovenbalk (of Ctrl+P). Kies in het afdrukvenster van je browser "Opslaan als PDF" om een digitaal bestand te maken in plaats van op papier af te drukken.
                </Section>

                <Section title="6. Thema">
                    Klik op een leeg gedeelte van het werkblad om de werkbundel-instellingen te openen. Onder <strong>Thema</strong> wissel je tussen Licht, Donker en Hoog contrast (kleurenblind-veilig).
                </Section>

                <Section title="Bugs of suggesties?">
                    Stuur een DM via X (zie 𝕏-knop onderaan de zijbalk).
                </Section>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '12px', color: 'var(--accent-purple)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>{children}</p>
        </div>
    );
}
