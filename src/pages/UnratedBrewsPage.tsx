import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Star } from 'lucide-react';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { RateBrewModal } from '../components/brewing/RateBrewModal';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import type { BrewingEntry } from '../types/brewing';
import { formatBrewingMethod } from '../lib/utils';

export function UnratedBrewsPage() {
  const { entries } = useBrewingEntries();
  const [rateTarget, setRateTarget] = useState<BrewingEntry | null>(null);

  const unratedEntries = entries.filter((e) => e.rating === 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Back to home">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Unrated Brews</h1>
            {unratedEntries.length > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {unratedEntries.length} brew{unratedEntries.length !== 1 ? 's' : ''} awaiting a rating
              </p>
            )}
          </div>
        </div>

        {unratedEntries.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Star className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">All brews rated!</h2>
              <p className="text-muted-foreground mt-1">You've rated all your brews. Great job!</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {unratedEntries.map((entry) => {
              const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setRateTarget(entry)}
                  className="w-full text-left rounded-xl border border-border bg-card hover:border-primary/50 transition-colors px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Rate ${entry.coffeeProducer} brew`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-medium text-card-foreground text-sm">{entry.coffeeProducer}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {entry.countryOfOrigin}
                      </span>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {entry.brewingMethod === 'other' && entry.brewingMethodCustom
                          ? entry.brewingMethodCustom
                          : formatBrewingMethod(entry.brewingMethod)}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">{date}</span>
                      <span className="text-xs text-primary font-medium">Tap to rate →</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <RateBrewModal
          entry={rateTarget}
          open={!!rateTarget}
          onClose={() => setRateTarget(null)}
        />
      </div>
    </Layout>
  );
}
