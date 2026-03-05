import { useEffect, useRef } from 'react';

/**
 * Reusable hook for modal close behavior:
 * 1. Closes on Escape key
 * 2. Pushes a #modal history entry and listens for popstate (browser back button)
 */
export function useModalClose(isOpen: boolean, onClose: () => void) {
    const hasHistory = useRef(false);

    useEffect(() => {
        if (!isOpen) return;

        // ESC key handler
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        // Push a history entry so browser back button closes the modal
        if (!hasHistory.current) {
            window.history.pushState({ modal: true }, '');
            hasHistory.current = true;
        }

        const handlePopState = () => {
            hasHistory.current = false;
            onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('popstate', handlePopState);

            // Clean up the history entry if modal closes without back button
            if (hasHistory.current) {
                hasHistory.current = false;
                window.history.back();
            }
        };
    }, [isOpen, onClose]);
}
