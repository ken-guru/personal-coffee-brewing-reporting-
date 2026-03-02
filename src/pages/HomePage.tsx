import { Link } from 'react-router-dom';
import { Plus, Coffee, TrendingUp, Globe } from 'lucide-react';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { useSharedBrews } from '../hooks/useSharedBrews';
import { BrewingCard } from '../components/brewing/BrewingCard';
import { SharedBrewCard } from '../components/brewing/SharedBrewCard';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout/Layout';

export function HomePage() {
  const { entries } = useBrewingEntries();
  const { brews: sharedBrews, loading: sharedLoading, error: sharedError } = useSharedBrews();

  // IDs of local entries that have been shared to the community
  const localEntryIds = new Set(entries.map((e) => e.id));
  const sharedEntryIds = new Set(
    sharedBrews.filter((s) => localEntryIds.has(s.shareId)).map((s) => s.shareId)
  );

  // Community brews that are NOT duplicates of local entries
  const communityBrews = sharedBrews.filter((s) => !localEntryIds.has(s.shareId));

  const avgRating =
    entries.length > 0
      ? (entries.reduce((sum, e) => sum + e.rating, 0) / entries.length).toFixed(1)
      : null;

  const communityAvgRating =
    communityBrews.length > 0
      ? (communityBrews.reduce((sum, s) => sum + s.brew.rating, 0) / communityBrews.length).toFixed(1)
      : null;

  return (
    <Layout>
      <div className="space-y-8">
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
            <Button asChild>
              <Link to="/new">
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                Log Brew
              </Link>
            </Button>
          </div>

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
            <div className="space-y-3">
              {entries.map((entry) => (
                <BrewingCard key={entry.id} entry={entry} isShared={sharedEntryIds.has(entry.id)} />
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
                <SharedBrewCard key={shared.shareId} shared={shared} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
