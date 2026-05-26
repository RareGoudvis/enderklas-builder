import { useWorksheetStore } from '../../../store/useWorksheetStore';
import type { MathBlock } from '../../../services/math/types';
import { sharedPluginStyles as styles } from './sharedPluginStyles';
import type { ClockType, ExerciseMode, MinuteDirection, HandChoice, TimeCategory } from '../../../services/clock/clockTypes';

interface Props { block: MathBlock; }

const TIME_TYPE_LABELS: Record<TimeCategory, string> = {
    uren: 'Uren  (3 uur, 12 uur)',
    halve_uren: 'Halve uren  (half 4)',
    kwartier_over: 'Kwartier over  (kwart over 3)',
    kwartier_voor: 'Kwartier voor  (kwart voor 4)',
    nauwkeurig_5: "Tot 5' nauwkeurig  (20 over 3)",
    nauwkeurig_1: "Tot 1' nauwkeurig  (23 over 3)",
};

export default function ClockConfig({ block }: Props) {
    const updateBlockSettings = useWorksheetStore((state) => state.updateBlockSettings);

    const {
        clockType = 'analoog' as ClockType,
        exerciseMode = 'lezen' as ExerciseMode,
        is24hour = false,
        timeTypes = ['uren', 'halve_uren', 'kwartier_over', 'kwartier_voor'] as TimeCategory[],
        minuteDirection = 'beide' as MinuteDirection,
        handChoice = 'beide' as HandChoice,
    } = block.constraints;

    const updateConstraint = (key: string, value: unknown) => {
        updateBlockSettings(block.id, { constraints: { ...block.constraints, [key]: value } });
    };

    const toggleTimeType = (type: TimeCategory) => {
        const current: TimeCategory[] = timeTypes;
        updateConstraint('timeTypes',
            current.includes(type)
                ? current.filter(t => t !== type)
                : [...current, type]
        );
    };

    const showMinuteDirection = timeTypes.includes('nauwkeurig_5') || timeTypes.includes('nauwkeurig_1');

    return (
        <div style={styles.container}>
            {/* ACTIVITEIT */}
            <div style={styles.section}>
                <label style={styles.label}>Activiteit:</label>
                <div style={styles.buttonGroup}>
                    <button onClick={() => updateConstraint('exerciseMode', 'lezen')} style={styles.radioBtn(exerciseMode === 'lezen')}>Lezen</button>
                    <button onClick={() => updateConstraint('exerciseMode', 'tekenen')} style={styles.radioBtn(exerciseMode === 'tekenen')}>Tekenen</button>
                    {clockType === 'analoog' && (
                        <button onClick={() => updateConstraint('exerciseMode', 'omzetten')} style={styles.radioBtn(exerciseMode === 'omzetten')}>Omzetten</button>
                    )}
                </div>
                {/* Context hint */}
                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {clockType === 'analoog' && exerciseMode === 'lezen' && 'Klok zien → tijd in woorden schrijven'}
                    {clockType === 'analoog' && exerciseMode === 'tekenen' && 'Tijd in woorden → wijzers tekenen op klok'}
                    {clockType === 'analoog' && exerciseMode === 'omzetten' && 'Klok zien → digitale tijd invullen'}
                    {clockType === 'digitaal' && exerciseMode === 'lezen' && 'Digitale tijd zien → tijd in woorden schrijven'}
                    {clockType === 'digitaal' && exerciseMode === 'tekenen' && 'Tijd in woorden → digitale klok invullen'}
                    {clockType === 'digitaal' && exerciseMode === 'omzetten' && 'Digitale tijd zien → wijzers tekenen op klok'}
                </div>
            </div>

            {/* TIJDSSYSTEEM */}
            <div style={styles.section}>
                <label style={styles.label}>Tijdssysteem:</label>
                <div style={styles.buttonGroup}>
                    <button onClick={() => updateConstraint('is24hour', false)} style={styles.radioBtn(!is24hour)}>12 uur  (1–12)</button>
                    <button onClick={() => updateConstraint('is24hour', true)} style={styles.radioBtn(is24hour)}>24 uur  (0–23)</button>
                </div>
            </div>

            {/* TIJDSTYPES */}
            <div style={styles.section}>
                <label style={styles.label}>Tijdstypes:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(Object.keys(TIME_TYPE_LABELS) as TimeCategory[]).map(type => (
                        <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-main)', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={timeTypes.includes(type)}
                                onChange={() => toggleTimeType(type)}
                                style={{ accentColor: 'var(--accent-purple)', width: '14px', height: '14px', flexShrink: 0, cursor: 'pointer' }}
                            />
                            {TIME_TYPE_LABELS[type]}
                        </label>
                    ))}
                </div>
            </div>

            {/* RICHTING (voor nauwkeurig types) */}
            {showMinuteDirection && (
                <div style={styles.section}>
                    <label style={styles.label}>Richting:</label>
                    <div style={styles.buttonGroup}>
                        <button onClick={() => updateConstraint('minuteDirection', 'over')} style={styles.radioBtn(minuteDirection === 'over')}>Over</button>
                        <button onClick={() => updateConstraint('minuteDirection', 'voor')} style={styles.radioBtn(minuteDirection === 'voor')}>Voor</button>
                        <button onClick={() => updateConstraint('minuteDirection', 'beide')} style={styles.radioBtn(minuteDirection === 'beide')}>Beide</button>
                    </div>
                </div>
            )}

            {/* TE TEKENEN WIJZER (analoog + tekenen) */}
            {clockType === 'analoog' && exerciseMode === 'tekenen' && (
                <div style={styles.section}>
                    <label style={styles.label}>Te tekenen wijzer(s):</label>
                    <div style={styles.buttonGroup}>
                        <button onClick={() => updateConstraint('handChoice', 'uur')} style={styles.radioBtn(handChoice === 'uur')}>Uurwijzer</button>
                        <button onClick={() => updateConstraint('handChoice', 'minuut')} style={styles.radioBtn(handChoice === 'minuut')}>Minutenwijzer</button>
                        <button onClick={() => updateConstraint('handChoice', 'beide')} style={styles.radioBtn(handChoice === 'beide')}>Beide</button>
                    </div>
                </div>
            )}
        </div>
    );
}
