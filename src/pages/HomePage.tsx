import { Link } from 'react-router-dom';
import { Plus, Coffee, TrendingUp } from 'lucide-react';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { BrewingCard } from '../components/brewing/BrewingCard';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout/Layout';

export function HomePage() {
  const { entries } = useBrewingEntries();

  const avgRating =
    entries.length > 0
      ? (entries.reduce((sum, e) => sum + e.rating, 0) / entries.length).toFixed(1)
      : null;

  return (
    <Layout>
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
    </Layout>
  );
}
