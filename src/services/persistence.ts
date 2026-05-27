import type { MathBlock, FooterData } from './math/types';
import type { DocSettings } from '../store/useWorksheetStore';

// Bump this when the JSON schema gains/loses required fields so older files
// fail loudly instead of half-loading. Keep the parser strict on read.
export const WORKSHEET_FORMAT_VERSION = 1;

interface HeaderData {
    naam: boolean;
    klas: boolean;
    nummer: boolean;
    datum: boolean;
    titel: string;
}

export interface WorksheetFile {
    version: number;
    exportedAt: string;
    blocks: MathBlock[];
    header: HeaderData;
    footer: FooterData;
    docSettings: DocSettings;
}

interface SerialisableState {
    blocks: MathBlock[];
    header: HeaderData;
    footer: FooterData;
    docSettings: DocSettings;
}

// Filesystem-safe slug from the worksheet title; falls back to 'naamloos'.
function safeSlug(s: string): string {
    const trimmed = (s || '').trim();
    if (!trimmed) return 'naamloos';
    return trimmed.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'naamloos';
}

function todayStamp(): string {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export function exportWorksheet(state: SerialisableState): void {
    const payload: WorksheetFile = {
        version: WORKSHEET_FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        blocks: state.blocks,
        header: state.header,
        footer: state.footer,
        docSettings: state.docSettings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `werkbundel-${safeSlug(state.header.titel)}-${todayStamp()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function parseWorksheetFile(json: string): WorksheetFile {
    let parsed: unknown;
    try {
        parsed = JSON.parse(json);
    } catch {
        throw new Error('Bestand is geen geldige JSON.');
    }
    if (!parsed || typeof parsed !== 'object') throw new Error('Bestand heeft geen geldig formaat.');
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.version !== 'number') throw new Error('Versie-veld ontbreekt of is ongeldig.');
    if (obj.version > WORKSHEET_FORMAT_VERSION) {
        throw new Error(`Bestand komt uit een nieuwere versie (v${obj.version}). Werk de app bij om dit te openen.`);
    }
    if (!Array.isArray(obj.blocks)) throw new Error('blocks-veld ontbreekt of is geen array.');
    if (!obj.header || typeof obj.header !== 'object') throw new Error('header-veld ontbreekt.');
    if (!obj.footer || typeof obj.footer !== 'object') throw new Error('footer-veld ontbreekt.');
    if (!obj.docSettings || typeof obj.docSettings !== 'object') throw new Error('docSettings-veld ontbreekt.');
    return obj as unknown as WorksheetFile;
}
