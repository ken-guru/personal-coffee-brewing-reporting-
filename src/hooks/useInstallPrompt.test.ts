import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInstallPrompt } from './useInstallPrompt';

describe('useInstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  function fireInstallPromptEvent() {
    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });
    act(() => {
      window.dispatchEvent(event);
    });
    return event;
  }

  it('is not visible initially', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isVisible).toBe(false);
  });

  it('becomes visible after delay when beforeinstallprompt fires', () => {
    const { result } = renderHook(() => useInstallPrompt());

    fireInstallPromptEvent();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('does not become visible when pwa-install-dismissed is set', () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    const { result } = renderHook(() => useInstallPrompt());

    fireInstallPromptEvent();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('handleDismiss hides the banner and sets localStorage', () => {
    const { result } = renderHook(() => useInstallPrompt());

    fireInstallPromptEvent();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.isVisible).toBe(true);

    act(() => {
      result.current.handleDismiss();
    });

    expect(result.current.isVisible).toBe(false);
    expect(localStorage.getItem('pwa-install-dismissed')).toBe('true');
  });

  it('handleInstall calls prompt and hides the banner', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = fireInstallPromptEvent();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.isVisible).toBe(true);

    await act(async () => {
      await result.current.handleInstall();
    });

    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(result.current.isVisible).toBe(false);
  });
});
