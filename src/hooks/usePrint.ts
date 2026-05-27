import { useWorksheetStore } from '../store/useWorksheetStore';

export function usePrint() {
    const handlePrint = (withSolutions: boolean) => {
        const store = useWorksheetStore.getState();
        const prevSolutions = store.showSolutions;
        const prevSelection = store.activeBlockId;
        store.setActiveSelection(null);
        if (withSolutions !== prevSolutions) store.setShowSolutions(withSolutions);

        const style = document.createElement('style');
        style.id = 'print-dynamic';
        // Suppress browser-injected header (top) + footer (bottom). Chrome/Edge honour
        // these margin-box rules; Firefox ignores them (user must uncheck in dialog).
        style.textContent = `@page { @top-left { content: ""; } @top-center { content: ""; } @top-right { content: ""; } @bottom-left { content: ""; } @bottom-center { content: ""; } @bottom-right { content: ""; } }`;
        document.head.appendChild(style);

        window.addEventListener('afterprint', () => {
            if (withSolutions !== prevSolutions) store.setShowSolutions(prevSolutions);
            store.setActiveSelection(prevSelection);
            document.getElementById('print-dynamic')?.remove();
        }, { once: true });

        setTimeout(() => window.print(), 0);
    };

    return { handlePrint };
}
