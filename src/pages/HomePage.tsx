import { Link } from 'react-router-dom';
import { Plus, Coffee, TrendingUp, Globe } from 'lucide-react';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { useSharedBrews } from '../hooks/useSharedBrews';
import { BrewingCard } from '../components/brewing/BrewingCard';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout/Layout';
import { Badge } from '../components/ui/Badge';
import { formatBrewingMethod } from '../lib/utils';

export function HomePage() {
  const { entries } = useBrewingEntries();
  const { brews: sharedBrews, loading: sharedLoading, error: sharedError } = useSharedBrews();

  const avgRating =
    entries.length > 0
      ? (entries.reduce((sum, e) => sum + e.rating, 0) / entries.length).toFixed(1)
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
                <BrewingCard key={entry.id} entry={entry} />
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

          {sharedLoading && (
            <p className="text-sm text-muted-foreground">Loading community brews…</p>
          )}

          {!sharedLoading && sharedError && (
            <p className="text-sm text-muted-foreground">Community brews unavailable.</p>
          )}

          {!sharedLoading && !sharedError && sharedBrews.length === 0 && (
            <p className="text-sm text-muted-foreground">No community brews shared yet. Be the first!</p>
          )}

          {!sharedLoading && !sharedError && sharedBrews.length > 0 && (
            <div className="space-y-3">
              {sharedBrews.map((shared) => (
                <Link
                  key={shared.shareId}
                  to={`/shared/${shared.shareId}`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                  aria-label={`View shared ${shared.brew.coffeeProducer} brew`}
                >
                  <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-card-foreground truncate">
                            {shared.brew.coffeeProducer}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {shared.brew.countryOfOrigin}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Coffee className="h-3 w-3 text-primary shrink-0" aria-hidden="true" />
                          <span className="text-sm text-muted-foreground">
                            {formatBrewingMethod(shared.brew.brewingMethod)}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-sm font-medium text-foreground">
                        {shared.brew.rating}★
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(shared.sharedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
