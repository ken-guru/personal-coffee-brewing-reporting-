import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALL_PROMPT_DELAY = 3000;
const DISMISSED_STORAGE_KEY = 'pwa-install-dismissed';

export interface UseInstallPromptResult {
  isVisible: boolean;
  handleInstall: () => Promise<void>;
  handleDismiss: () => void;
}

export function useInstallPrompt(): UseInstallPromptResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      setTimeout(() => {
        if (!localStorage.getItem(DISMISSED_STORAGE_KEY)) {
          setIsVisible(true);
        }
      }, INSTALL_PROMPT_DELAY);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch (error) {
      console.error('Error showing install prompt:', error);
    } finally {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  return { isVisible, handleInstall, handleDismiss };
}
