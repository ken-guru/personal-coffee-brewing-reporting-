import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export function PWAInstallPrompt() {
  const { isVisible, handleInstall, handleDismiss } = useInstallPrompt();

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-label="Install app prompt"
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-lg border border-border bg-card p-4 shadow-lg',
        'flex items-start justify-between gap-3'
      )}
    >
      <div className="flex items-start gap-3">
        <Download className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-card-foreground">Install BrewLog</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add to your home screen for quick access and offline support.
          </p>
          <Button
            variant="default"
            size="sm"
            className="mt-2"
            onClick={handleInstall}
          >
            Install App
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
