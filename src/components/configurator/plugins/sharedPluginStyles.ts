import React from 'react';

export const sharedPluginStyles = {
    container: {} as React.CSSProperties,

    section: {
        marginBottom: '24px'
    } as React.CSSProperties,

    label: {
        display: 'block',
        fontSize: '13px',
        color: 'var(--text-muted)',
        marginBottom: '8px'
    } as React.CSSProperties,

    buttonGroup: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap' // Zorgt dat het netjes op een nieuwe regel breekt als de zijbalk krap wordt
    } as React.CSSProperties,

    radioBtn: (active: boolean): React.CSSProperties => ({
        flex: 1,
        padding: '8px 12px',
        fontSize: '11px',
        borderRadius: '4px',
        cursor: 'pointer',
        border: '1px solid var(--border-color)',
        backgroundColor: active ? 'var(--accent-purple)' : 'var(--bg-input)',
        color: active ? 'white' : 'var(--text-muted)',
        fontWeight: active ? 'bold' : 'normal',
        textAlign: 'center',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }),

    // Independently-toggleable pill (multi-select), themed like radioBtn but auto-width.
    pill: (active: boolean): React.CSSProperties => ({
        padding: '6px 12px',
        fontSize: '11px',
        borderRadius: '14px',
        cursor: 'pointer',
        border: `1px solid ${active ? 'var(--accent-purple)' : 'var(--border-color)'}`,
        backgroundColor: active ? 'var(--accent-purple)' : 'var(--bg-input)',
        color: active ? 'white' : 'var(--text-muted)',
        fontWeight: active ? 'bold' : 'normal',
        transition: 'all 0.15s',
    }),

    // Label + single Aan/Uit toggle button on one row.
    onOffRow: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', marginBottom: '8px',
    } as React.CSSProperties,
    onOffLabel: { fontSize: '12px', color: 'var(--text-main)' } as React.CSSProperties,
    onOffBtn: (on: boolean): React.CSSProperties => ({
        flexShrink: 0, minWidth: '52px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold',
        borderRadius: '4px', cursor: 'pointer',
        border: `1px solid ${on ? 'var(--accent-purple)' : 'var(--border-color)'}`,
        backgroundColor: on ? 'var(--accent-purple)' : 'var(--bg-input)',
        color: on ? 'white' : 'var(--text-muted)',
    }),
};