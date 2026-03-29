import { Share2, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface MassActionToolbarProps {
  selectedCount: number;
  sharing: boolean;
  onShare: () => void;
  onCancel: () => void;
}

export function MassActionToolbar({ selectedCount, sharing, onShare, onCancel }: MassActionToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Mass actions"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm shadow-lg transform transition-transform duration-200 ease-out translate-y-0"
    >
      <div className="container mx-auto max-w-3xl flex items-center justify-between px-4 py-3 gap-3">
        <span className="text-sm font-medium text-foreground">
          {selectedCount} brew{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onShare}
            disabled={sharing || selectedCount === 0}
          >
            {sharing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" aria-hidden="true" />
            ) : (
              <Share2 className="h-4 w-4 mr-1" aria-hidden="true" />
            )}
            {sharing ? 'Sharing…' : 'Share to Community'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} aria-label="Exit selection mode">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
