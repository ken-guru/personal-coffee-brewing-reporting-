import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { SharedBrew } from '../types/sharedBrew';
import type { BrewingEntry } from '../types/brewing';
import { BrewingDetail } from '../components/brewing/BrewingDetail';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';

export function SharedBrewPage() {
  const { id } = useParams<{ id: string }>();
  const [sharedBrew, setSharedBrew] = useState<SharedBrew | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchBrew() {
      try {
        const res = await fetch(`/api/brews/${id}`);

        // Detect non-JSON responses (e.g. HTML from deployment protection or
        // a cross-origin auth redirect that fetch followed automatically).
        const contentType = res.headers.get('content-type') ?? '';
        if (!contentType.includes('application/json')) {
          if (!cancelled) {
            setError(
              res.status === 401 || res.redirected
                ? 'Authentication required. Please reload the page or open the link in a regular browser window.'
                : 'Unexpected response from server. The API may be unavailable.'
            );
          }
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string };
          if (!cancelled) {
            setError(res.status === 404 ? 'This shared brew was not found.' : (data.error ?? 'Failed to load this brew.'));
          }
          return;
        }
        const data = await res.json().catch(() => null) as SharedBrew | null;
        if (!data) {
          if (!cancelled) setError('Invalid response from server.');
          return;
        }
        if (!cancelled) {
          setSharedBrew(data);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load this brew.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBrew();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Loading brew…</p>
        </div>
      </Layout>
    );
  }

  if (error || !sharedBrew) {
    return (
      <Layout>
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground">{error ?? 'Brew not found.'}</p>
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Adapt SharedBrew to the BrewingEntry shape expected by BrewingDetail
  const entry: BrewingEntry = {
    ...sharedBrew.brew,
    id: sharedBrew.shareId,
    createdAt: sharedBrew.sharedAt,
    updatedAt: sharedBrew.sharedAt,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Back to home">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">Shared Brew</span>
        </div>
        <BrewingDetail entry={entry} />
      </div>
    </Layout>
  );
}
