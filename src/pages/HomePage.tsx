import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Coffee, TrendingUp, Globe, Copy, Star, CheckSquare } from 'lucide-react';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { useSharedBrews } from '../hooks/useSharedBrews';
import { BrewingCard } from '../components/brewing/BrewingCard';
import { SharedBrewCard } from '../components/brewing/SharedBrewCard';
import { RateBrewModal } from '../components/brewing/RateBrewModal';
import { MassActionToolbar } from '../components/brewing/MassActionToolbar';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout/Layout';
import { BrewingEntry } from '../types/brewing';
import { formatBrewingMethod } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/Dialog';

export function HomePage() {
  const navigate = useNavigate();
  const { entries, editEntry } = useBrewingEntries();
  const { brews: sharedBrews, loading: sharedLoading, error: sharedError } = useSharedBrews();
  const [duplicateTarget, setDuplicateTarget] = useState<BrewingEntry | null>(null);
  const [rateTarget, setRateTarget] = useState<BrewingEntry | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [massSharing, setMassSharing] = useState(false);
  const [massShareResult, setMassShareResult] = useState<{ success: number; error?: string } | null>(null);

  // IDs of local entries that have been shared to the community
  const localEntryIds = new Set(entries.map((e) => e.id));
  const sharedEntryIds = new Set(
    sharedBrews.filter((s) => localEntryIds.has(s.shareId)).map((s) => s.shareId)
  );

  // Community brews that are NOT duplicates of local entries
  const communityBrews = sharedBrews.filter((s) => !localEntryIds.has(s.shareId));

  // Unrated brews from today only
  const todayStr = new Date().toDateString();
  const todayUnrated = entries.filter(
    (e) => e.rating === 0 && new Date(e.createdAt).toDateString() === todayStr
  );
  const UNRATED_MAX = 5;
  const unratedToShow = todayUnrated.slice(0, UNRATED_MAX);

  const avgRating =
    entries.length > 0
      ? (entries.reduce((sum, e) => sum + e.rating, 0) / entries.length).toFixed(1)
      : null;

  const communityAvgRating =
    communityBrews.length > 0
      ? (communityBrews.reduce((sum, s) => sum + s.brew.rating, 0) / communityBrews.length).toFixed(1)
      : null;

  const confirmDuplicate = () => {
    if (!duplicateTarget) return;
    navigate('/new', { state: { duplicateFrom: duplicateTarget } });
    setDuplicateTarget(null);
  };

  // Only rated brews can be shared
  const shareableEntries = entries.filter((e) => e.rating !== 0);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === shareableEntries.length) return new Set();
      return new Set(shareableEntries.map((e) => e.id));
    });
  }, [shareableEntries]);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleMassShare = useCallback(async () => {
    const toShare = entries.filter((e) => selectedIds.has(e.id) && e.rating !== 0);
    if (toShare.length === 0) return;

    setMassSharing(true);
    setMassShareResult(null);
    try {
      const res = await fetch('/api/brews/share-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toShare),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? 'Failed to share brews');
      }
      const data = await res.json() as { results: Array<{ shareId: string }> };
      setMassShareResult({ success: data.results.length });
      exitSelectionMode();
    } catch (err) {
      setMassShareResult({ success: 0, error: err instanceof Error ? err.message : 'Failed to share brews' });
    } finally {
      setMassSharing(false);
    }
  }, [entries, selectedIds, exitSelectionMode]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Unrated brews section — today's brews awaiting a rating */}
        {unratedToShow.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-foreground">Rate Today's Brews</h2>
              </div>
              {todayUnrated.length > UNRATED_MAX && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/unrated">View all {todayUnrated.length}</Link>
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {unratedToShow.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setRateTarget(entry)}
                  className="w-full text-left rounded-xl border border-border bg-card hover:border-primary/50 transition-colors px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Rate ${entry.coffeeProducer} brew`}
                >
                  <span className="font-medium text-card-foreground text-sm">{entry.coffeeProducer}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {entry.brewingMethod === 'other' && entry.brewingMethodCustom
                      ? entry.brewingMethodCustom
                      : formatBrewingMethod(entry.brewingMethod)}
                  </span>
                  <span className="ml-2 text-xs text-primary font-medium">Tap to rate →</span>
                </button>
              ))}
            </div>
            {todayUnrated.length > UNRATED_MAX && (
              <p className="text-xs text-muted-foreground text-center">
                Showing {UNRATED_MAX} of {todayUnrated.length} unrated brews today.{' '}
                <Link to="/unrated" className="underline">View all unrated brews</Link>
              </p>
            )}
          </div>
        )}

        {/* My Brews section */}
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Brews</h1>
              {entries.length > 0 && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {entries.length} session{entries.length !== 1 ? 's' : ''} logged
                  {avgRating && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      avg {avgRating}★
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {shareableEntries.length > 0 && (
                <Button
                  variant={selectionMode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={toggleSelectionMode}
                  aria-label={selectionMode ? 'Exit selection mode' : 'Enter selection mode'}
                >
                  <CheckSquare className="h-4 w-4 mr-1" aria-hidden="true" />
                  {selectionMode ? 'Cancel' : 'Select'}
                </Button>
              )}
              {!selectionMode && (
                <Button asChild>
                  <Link to="/new">
                    <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                    Log Brew
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Select all / Deselect all when in selection mode */}
          {selectionMode && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                {selectedIds.size === shareableEntries.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedIds.size > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} of {shareableEntries.length} rated brew{shareableEntries.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
          )}

          {/* Entries list */}
          {entries.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <Coffee className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">No brews logged yet</h2>
                <p className="text-muted-foreground mt-1">
                  Start tracking your coffee journey!
                </p>
              </div>
              <Button asChild size="lg">
                <Link to="/new">
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Log Your First Brew
                </Link>
              </Button>
            </div>
          ) : (
            <div className={`space-y-3 ${selectionMode ? 'pb-20' : ''}`}>
              {entries.map((entry) => (
                <BrewingCard
                  key={entry.id}
                  entry={entry}
                  isShared={sharedEntryIds.has(entry.id)}
                  onDuplicate={selectionMode ? undefined : () => setDuplicateTarget(entry)}
                  selectionMode={selectionMode}
                  selected={selectedIds.has(entry.id)}
                  onToggleSelect={entry.rating !== 0 ? toggleSelect : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Community Brews section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-xl font-bold text-foreground">Community Brews</h2>
          </div>

          {!sharedLoading && !sharedError && communityBrews.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {communityBrews.length} session{communityBrews.length !== 1 ? 's' : ''} logged
              {communityAvgRating && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  avg {communityAvgRating}★
                </span>
              )}
            </p>
          )}

          {sharedLoading && (
            <p className="text-sm text-muted-foreground">Loading community brews…</p>
          )}

          {!sharedLoading && sharedError && (
            <p className="text-sm text-muted-foreground">Community brews unavailable.</p>
          )}

          {!sharedLoading && !sharedError && communityBrews.length === 0 && (
            <p className="text-sm text-muted-foreground">No community brews shared yet. Be the first!</p>
          )}

          {!sharedLoading && !sharedError && communityBrews.length > 0 && (
            <div className="space-y-3">
              {communityBrews.map((shared) => (
                <SharedBrewCard
                  key={shared.shareId}
                  shared={shared}
                  onDuplicate={() => setDuplicateTarget({
                    ...shared.brew,
                    coffeeVariety: typeof shared.brew.coffeeVariety === 'string'
                      ? (shared.brew.coffeeVariety ? [shared.brew.coffeeVariety] : undefined)
                      : shared.brew.coffeeVariety,
                    id: shared.shareId,
                    createdAt: shared.sharedAt,
                    updatedAt: shared.sharedAt,
                  })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Duplicate confirmation dialog */}
      <Dialog open={!!duplicateTarget} onOpenChange={(open) => { if (!open) setDuplicateTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Brew</DialogTitle>
            <DialogDescription>
              Duplicate <strong>{duplicateTarget?.coffeeProducer}</strong>? All brew details will be
              copied into a new brew for you to adjust and log.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDuplicateTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmDuplicate}>
              <Copy className="h-4 w-4 mr-1" aria-hidden="true" />
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating modal for unrated brews */}
      <RateBrewModal
        entry={rateTarget}
        open={!!rateTarget}
        onClose={() => setRateTarget(null)}
        onSave={(rating) => {
          if (rateTarget) editEntry({ ...rateTarget, rating, updatedAt: new Date().toISOString() });
        }}
      />

      {/* Mass action toolbar — slides in from bottom */}
      {selectionMode && selectedIds.size > 0 && (
        <MassActionToolbar
          selectedCount={selectedIds.size}
          sharing={massSharing}
          onShare={handleMassShare}
          onCancel={exitSelectionMode}
        />
      )}

      {/* Mass share result dialog */}
      <Dialog open={!!massShareResult} onOpenChange={(open) => { if (!open) setMassShareResult(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{massShareResult?.error ? 'Sharing failed' : 'Brews shared!'}</DialogTitle>
            <DialogDescription>
              {massShareResult?.error
                ? massShareResult.error
                : `Successfully shared ${massShareResult?.success} brew${massShareResult?.success !== 1 ? 's' : ''} to the community.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setMassShareResult(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
