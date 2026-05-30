import { Component, useMemo, useRef, useState, useEffect, useLayoutEffect, type ReactNode } from 'react';
import type { MathBlock } from '../../services/math/types';
import { REGISTRY } from '../../config/exerciseRegistry';
import { EXERCISE_UI } from '../../config/exerciseUI';

interface Props {
    typeId: string;
    constraints: Record<string, unknown>;   // fully resolved constraints (defaults + base + variant + edits)
    nonce?: number;                          // bump to force a fresh random generation
    height?: number;                         // clip-box height; default 150
}

// Build a throwaway block and call the generator DIRECTLY — never touches the
// store / setExercises. Caller passes the already-resolved constraints.
function buildPreviewBlock(typeId: string, constraints: Record<string, unknown>): MathBlock | null {
    const def = REGISTRY[typeId];
    if (!def) return null;
    const block: MathBlock = {
        id: `preview-${typeId}`,
        typeId,
        instructionText: '',
        instructionMode: 'geen',
        layoutPreset: 'inline-short',
        steppedLines: 3,
        numberOfExercises: 1,
        totalPoints: 0,
        verticalSpacing: 14,
        constraints,
        exercises: [],
    };
    const data = def.generate(block);
    return { ...block, [def.exerciseField]: data };
}

// One bad constraint combo must not crash a parent rendering many live viewers.
class PreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidUpdate(prev: { children: ReactNode }) {
        if (prev.children !== this.props.children && this.state.failed) this.setState({ failed: false });
    }
    render() {
        if (this.state.failed) return <div style={fallbackStyle}>Voorbeeld niet beschikbaar</div>;
        return this.props.children;
    }
}

// Only build/render once scrolled into view — many live generators+viewers at once
// is a real perf cost.
function useInView<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el || inView) return;
        const obs = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) { setInView(true); obs.disconnect(); }
        }, { rootMargin: '200px' });
        obs.observe(el);
        return () => obs.disconnect();
    }, [inView]);
    return { ref, inView };
}

export default function ExercisePreview({ typeId, constraints, nonce = 0, height = 150 }: Props) {
    const { ref: boxRef, inView } = useInView<HTMLDivElement>();
    const innerRef = useRef<HTMLDivElement>(null);
    const [fitT, setFitT] = useState({ scale: 1, tx: 0, ty: 0 });
    const constraintsKey = JSON.stringify(constraints);

    const block = useMemo(() => {
        if (!inView) return null;
        try {
            return buildPreviewBlock(typeId, constraints);
        } catch {
            return null;
        }
        // constraints captured via stable JSON key
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeId, constraintsKey, nonce, inView]);

    const Viewer = EXERCISE_UI[typeId]?.Viewer;

    // Measure the unscaled content and the box, then scale so the WHOLE example fits.
    // transform doesn't affect layout, so measuring the (unscaled) inner is stable.
    useLayoutEffect(() => {
        const box = boxRef.current;
        const inner = innerRef.current;
        if (!box || !inner || !block) return;
        const fit = () => {
            const boxW = box.clientWidth - PAD * 2;    // available width inside padding
            const boxH = box.clientHeight - PAD * 2;
            const contentW = inner.scrollWidth;        // natural content size (unscaled)
            const contentH = inner.scrollHeight;
            if (!contentW || !contentH || boxW <= 0 || boxH <= 0) { setFitT({ scale: 1, tx: 0, ty: 0 }); return; }
            const raw = Math.min(1, boxW / contentW, boxH / contentH);
            const scale = raw > 0 && Number.isFinite(raw) ? raw : 1;
            // Center the scaled content within the available box.
            const tx = Math.max(0, (boxW - contentW * scale) / 2);
            const ty = Math.max(0, (boxH - contentH * scale) / 2);
            setFitT({ scale, tx, ty });
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(box);
        ro.observe(inner);
        return () => ro.disconnect();
        // re-measure when content changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [block, constraintsKey, nonce, inView]);

    return (
        <div ref={boxRef} style={{ ...wrapStyle, height }}>
            {!inView && <div style={fallbackStyle}>…</div>}
            {inView && (!block || !Viewer
                ? <div style={fallbackStyle}>Voorbeeld niet beschikbaar</div>
                : (
                    <div ref={innerRef} style={{ ...scaleWrap, transform: `translate(${fitT.tx}px, ${fitT.ty}px) scale(${fitT.scale})` }}>
                        <PreviewBoundary key={`${constraintsKey}:${nonce}`}>
                            <Viewer block={block} showSolutions />
                        </PreviewBoundary>
                    </div>
                ))}
        </div>
    );
}

const PAD = 10;
const wrapStyle: React.CSSProperties = {
    overflow: 'hidden', pointerEvents: 'none',
    fontSize: '13px', color: '#000', background: '#fff',
    borderRadius: '6px', padding: `${PAD}px`, boxSizing: 'border-box',
};
// Inner shrinks to content width (max-content) so the fit math sees the true size and
// can center on both axes. Measured unscaled; transform applied inline.
const scaleWrap: React.CSSProperties = {
    transformOrigin: 'top left', width: 'max-content', maxWidth: 'none',
};
const fallbackStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: '#999', fontSize: '12px', fontStyle: 'italic',
};
