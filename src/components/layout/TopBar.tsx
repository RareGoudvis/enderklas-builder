import { useRef, useState } from 'react';
import { Undo2, Redo2, Sparkles, Download, Upload, Bookmark, Share2, LayoutTemplate, Eye, EyeOff, Printer, Check } from 'lucide-react';
import { useWorksheetStore } from '../../store/useWorksheetStore';
import { exportWorksheet, parseWorksheetFile, encodeShareLink } from '../../services/persistence';
import IconButton from '../ui/IconButton';
import PresetModal from './PresetModal';

interface Props {
    onPrint: (withSolutions: boolean) => void;
    onOpenHelp?: () => void;
}

export default function TopBar({ onPrint }: Props) {
    const undo = useWorksheetStore((s) => s.undo);
    const redo = useWorksheetStore((s) => s.redo);
    const canUndo = useWorksheetStore((s) => s.canUndo());
    const canRedo = useWorksheetStore((s) => s.canRedo());
    const showSolutions = useWorksheetStore((s) => s.showSolutions);
    const setShowSolutions = useWorksheetStore((s) => s.setShowSolutions);
    const generateAllBlocks = useWorksheetStore((s) => s.generateAllBlocks);
    const loadWorksheet = useWorksheetStore((s) => s.loadWorksheet);
    const hasBlocks = useWorksheetStore((s) => s.blocks.length > 0);

    const importInputRef = useRef<HTMLInputElement>(null);
    const [presetOpen, setPresetOpen] = useState(false);
    const [shareFlash, setShareFlash] = useState<'full' | 'template' | null>(null);

    const handleExport = () => {
        const st = useWorksheetStore.getState();
        exportWorksheet({ blocks: st.blocks, header: st.header, footer: st.footer, docSettings: st.docSettings });
    };

    const handleImportClick = () => importInputRef.current?.click();

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = parseWorksheetFile(String(reader.result));
                if (!window.confirm('Huidige werkbundel wordt vervangen. Doorgaan?')) return;
                loadWorksheet(parsed);
            } catch (err) {
                window.alert(`Importeren mislukt: ${(err as Error).message}`);
            }
        };
        reader.onerror = () => window.alert('Bestand kon niet gelezen worden.');
        reader.readAsText(file);
    };

    const handleShare = async (mode: 'full' | 'template') => {
        const st = useWorksheetStore.getState();
        const link = encodeShareLink({ blocks: st.blocks, header: st.header, footer: st.footer, docSettings: st.docSettings }, { template: mode === 'template' });
        if (!link) {
            window.alert('Werkbundel te groot voor een deelbare link. Gebruik Exporteer i.p.v.');
            return;
        }
        try {
            await navigator.clipboard.writeText(link);
            setShareFlash(mode);
            setTimeout(() => setShareFlash(null), 2000);
        } catch {
            window.prompt('Kopieer deze link:', link);
        }
    };

    return (
        <div style={S.bar}>
            <div style={S.group}>
                <IconButton icon={Undo2} label="Ongedaan maken (Ctrl+Z)" onClick={undo} disabled={!canUndo} />
                <IconButton icon={Redo2} label="Opnieuw (Ctrl+Y)" onClick={redo} disabled={!canRedo} />
            </div>

            <IconButton
                icon={Sparkles}
                label="Alle niet-vergrendelde blokken opnieuw genereren"
                visibleLabel="Genereer alles"
                onClick={() => hasBlocks && generateAllBlocks()}
                disabled={!hasBlocks}
                variant="primary"
            />

            <div style={S.group}>
                <IconButton icon={Download} label="Exporteer als JSON-bestand" onClick={handleExport} />
                <IconButton icon={Upload} label="Importeer JSON-bestand" onClick={handleImportClick} />
                <IconButton icon={Bookmark} label="Presets beheren" onClick={() => setPresetOpen(true)} />
                <IconButton
                    icon={shareFlash === 'full' ? Check : Share2}
                    label={shareFlash === 'full' ? 'Link gekopieerd' : 'Deel link (volledig)'}
                    onClick={() => handleShare('full')}
                    variant={shareFlash === 'full' ? 'active' : 'neutral'}
                />
                <IconButton
                    icon={shareFlash === 'template' ? Check : LayoutTemplate}
                    label={shareFlash === 'template' ? 'Sjabloon-link gekopieerd' : 'Deel sjabloon (enkel instellingen)'}
                    onClick={() => handleShare('template')}
                    variant={shareFlash === 'template' ? 'active' : 'neutral'}
                />
                <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportFile}
                    style={{ display: 'none' }}
                />
            </div>

            <div style={S.spacer} />

            <IconButton
                icon={showSolutions ? EyeOff : Eye}
                label={showSolutions ? 'Oplossingen verbergen' : 'Oplossingen tonen'}
                onClick={() => setShowSolutions(!showSolutions)}
                variant={showSolutions ? 'danger' : 'neutral'}
            />

            <div style={S.group}>
                <IconButton
                    icon={Printer}
                    label="Afdrukken (Ctrl+P)"
                    visibleLabel="Afdrukken"
                    onClick={() => onPrint(false)}
                    variant="primary"
                />
                <IconButton
                    icon={Printer}
                    label="Afdrukken met oplossingen"
                    onClick={() => onPrint(true)}
                    variant="primary"
                />
            </div>

            {presetOpen && <PresetModal onClose={() => setPresetOpen(false)} />}
        </div>
    );
}

const S = {
    bar: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 16px',
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        marginBottom: '12px',
        flexShrink: 0,
        flexWrap: 'wrap',
    } as React.CSSProperties,
    group: { display: 'flex', gap: '4px' } as React.CSSProperties,
    spacer: { flex: 1 } as React.CSSProperties,
};
