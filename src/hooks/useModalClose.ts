import { useEffect, useRef } from 'react';

/**
 * Reusable hook for modal close behavior:
 * 1. Closes on Escape key
 * 2. Pushes a #modal history entry and listens for popstate (browser back button)
 *
 * `onClose` is read from a ref so parent re-renders (new function identity) do not
 * re-run this effect — otherwise cleanup would call history.back() while the modal
 * is still open and break the flow.
 */
export function useModalClose(isOpen: boolean, onClose: () => void) {
    const hasHistory = useRef(false);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCloseRef.current();
            }
        };

        if (!hasHistory.current) {
            window.history.pushState({ modal: true }, '');
            hasHistory.current = true;
        }

        const handlePopState = () => {
            hasHistory.current = false;
            onCloseRef.current();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('popstate', handlePopState);

            if (hasHistory.current) {
                hasHistory.current = false;
                window.history.back();
            }
        };
    }, [isOpen]);
}
