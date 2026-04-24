import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModalClose } from '../useModalClose';

describe('useModalClose', () => {
    const back = vi.fn();
    const pushState = vi.fn();

    beforeEach(() => {
        back.mockClear();
        pushState.mockClear();
        vi.spyOn(window.history, 'back').mockImplementation(back);
        vi.spyOn(window.history, 'pushState').mockImplementation(pushState);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('does not call history.back when only the onClose callback identity changes while open', () => {
        const a = vi.fn();
        const b = vi.fn();

        const { rerender } = renderHook(({ onClose }: { onClose: () => void }) => useModalClose(true, onClose), {
            initialProps: { onClose: a },
        });

        expect(pushState).toHaveBeenCalledTimes(1);
        expect(back).not.toHaveBeenCalled();

        rerender({ onClose: b });

        expect(back).not.toHaveBeenCalled();
    });

    it('calls history.back once when modal closes (isOpen false)', () => {
        const onClose = vi.fn();
        const { rerender } = renderHook(({ open }) => useModalClose(open, onClose), {
            initialProps: { open: true },
        });

        expect(pushState).toHaveBeenCalledTimes(1);

        rerender({ open: false });

        expect(back).toHaveBeenCalledTimes(1);
    });

    it('invokes latest onClose on Escape', () => {
        const onClose = vi.fn();
        renderHook(() => useModalClose(true, onClose));

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
