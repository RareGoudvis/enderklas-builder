import type { LucideIcon } from 'lucide-react';
import type { MouseEvent } from 'react';

export type IconButtonVariant = 'primary' | 'neutral' | 'danger' | 'active';

interface Props {
    icon: LucideIcon;
    label: string;                // tooltip + aria-label
    visibleLabel?: string;        // text shown alongside the icon (used for CTAs)
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    variant?: IconButtonVariant;
    size?: number;                // icon size in px
}

// Centralised button styling so TopBar / sidebar / block overlay all share
// one visual language. Three semantic tiers + an "active" toggle state.
// All colour tokens come from CSS variables so themes flow through.
export default function IconButton({
    icon: Icon, label, visibleLabel, onClick, disabled = false,
    variant = 'neutral', size = 18,
}: Props) {
    const style = computeStyle(variant, disabled, !!visibleLabel);
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            aria-disabled={disabled || undefined}
            style={style}
        >
            <Icon size={size} strokeWidth={2} aria-hidden="true" />
            {visibleLabel && <span style={labelTextStyle}>{visibleLabel}</span>}
        </button>
    );
}

function computeStyle(variant: IconButtonVariant, disabled: boolean, hasLabel: boolean): React.CSSProperties {
    const base: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: hasLabel ? '6px' : 0,
        height: '32px',
        minWidth: hasLabel ? undefined : '32px',
        padding: hasLabel ? '0 12px' : 0,
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid var(--border-color)',
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: 'inherit',
        transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
        opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
        case 'primary':
            return {
                ...base,
                backgroundColor: 'var(--accent-purple)',
                color: '#fff',
                borderColor: 'var(--accent-purple)',
            };
        case 'danger':
            return {
                ...base,
                backgroundColor: 'rgba(225,29,72,0.12)',
                color: '#e11d48',
                borderColor: '#e11d48',
            };
        case 'active':
            return {
                ...base,
                backgroundColor: 'rgba(172,41,233,0.15)',
                color: 'var(--accent-purple)',
                borderColor: 'var(--accent-purple)',
            };
        case 'neutral':
        default:
            return {
                ...base,
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-main)',
            };
    }
}

const labelTextStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
};
