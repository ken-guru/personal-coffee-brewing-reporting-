import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit2, Trash2, ChevronLeft, Share2, Copy, Check, Star } from 'lucide-react';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { BrewingDetail } from '../components/brewing/BrewingDetail';
import { RateBrewModal } from '../components/brewing/RateBrewModal';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/Dialog';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, removeEntry } = useBrewingEntries();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Brew not found.</p>
          <Button asChild className="mt-4">
            <Link to="/">Back to list</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    removeEntry(entry.id);
    navigate('/');
  };

  const handleDuplicate = () => {
    navigate('/new', { state: { duplicateFrom: entry } });
  };

  const handleShare = async () => {
    setSharing(true);
    setShareError(null);
    try {
      const res = await fetch('/api/brews/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? 'Failed to share brew');
      }
      const data = await res.json() as { shareUrl: string };
      setShareUrl(data.shareUrl);
      setShareOpen(true);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Failed to share brew');
      setShareOpen(true);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Back to list">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex gap-2">
            {entry.rating === 0 ? (
              <Button variant="outline" size="sm" onClick={() => setRateOpen(true)}>
                <Star className="h-4 w-4 mr-1" aria-hidden="true" />
                Rate
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleShare} disabled={sharing}>
                <Share2 className="h-4 w-4 mr-1" aria-hidden="true" />
                {sharing ? 'Sharing…' : 'Share'}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setDuplicateOpen(true)}>
              <Copy className="h-4 w-4 mr-1" aria-hidden="true" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/brew/${entry.id}/edit`}>
                <Edit2 className="h-4 w-4 mr-1" aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Brew</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this brewing session for{' '}
                    <strong>{entry.coffeeProducer}</strong>? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Duplicate confirmation dialog */}
        <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicate Brew</DialogTitle>
              <DialogDescription>
                Duplicate <strong>{entry.coffeeProducer}</strong>? All brew details will be
                copied and you will be taken to the rating step.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDuplicateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-1" aria-hidden="true" />
                Duplicate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share result dialog */}
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{shareError ? 'Sharing failed' : 'Brew shared!'}</DialogTitle>
              <DialogDescription>
                {shareError
                  ? shareError
                  : 'Anyone with this link can view your brew. No personal information is stored.'}
              </DialogDescription>
            </DialogHeader>
            {shareUrl && !shareError && (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  aria-label="Share URL"
                  onFocus={(e) => e.target.select()}
                />
                <Button variant="outline" size="icon" onClick={handleCopyLink} aria-label="Copy link">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShareOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rating modal */}
        <RateBrewModal
          entry={entry}
          open={rateOpen}
          onClose={() => setRateOpen(false)}
        />

        {/* Unrated note */}
        {entry.rating === 0 && (
          <p className="text-sm text-muted-foreground bg-muted rounded-lg px-4 py-3">
            This brew is <strong>unrated</strong>. Rate it first to unlock sharing.
          </p>
        )}

        <BrewingDetail entry={entry} />
      </div>
    </Layout>
  );
}
