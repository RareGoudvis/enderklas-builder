import { useWorksheetStore } from '../../../store/useWorksheetStore';
import type { MathBlock } from '../../../services/math/types';
import { sharedPluginStyles as styles } from './sharedPluginStyles';

interface Props { block: MathBlock; }

const MAX_PRESETS = [20, 100, 1000, 10000];

export default function EvenOnevenConfig({ block }: Props) {
    const updateBlockSettings = useWorksheetStore((state) => state.updateBlockSettings);
    const { subType = 'rooster', maxGetal = 100, target = 'even', perRow = 10 } = block.constraints;

    const set = (key: string, value: unknown) =>
        updateBlockSettings(block.id, { constraints: { ...block.constraints, [key]: value } });

    return (
        <div style={styles.container}>
            {/* Wat moet gekleurd worden */}
            <div style={styles.section}>
                <label style={styles.label}>Kleur de:</label>
                <div style={styles.buttonGroup}>
                    <button onClick={() => set('target', 'even')} style={styles.radioBtn(target === 'even')}>Even getallen</button>
                    <button onClick={() => set('target', 'oneven')} style={styles.radioBtn(target === 'oneven')}>Oneven getallen</button>
                </div>
            </div>

            {subType === 'rooster' ? (
                <>
                    <div style={styles.section}>
                        <label style={styles.label}>Maximum getal:</label>
                        <div style={styles.buttonGroup}>
                            {MAX_PRESETS.map(val => (
                                <button key={val} onClick={() => set('maxGetal', val)} style={styles.radioBtn(maxGetal === val)}>Tot {val.toLocaleString('nl-BE')}</button>
                            ))}
                        </div>
                    </div>
                    <div style={styles.section}>
                        <label style={styles.label}>Getallen per rij: {perRow}</label>
                        <input type="range" min="5" max="14" step="1" value={perRow}
                            onChange={(e) => set('perRow', Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }} />
                    </div>
                </>
            ) : (
                <div style={styles.section}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                        Elke oefening toont een aantal cirkels (max 24). De leerling groepeert ze per 2 en bepaalt even of oneven.
                    </p>
                </div>
            )}
        </div>
    );
}
