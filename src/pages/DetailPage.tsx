import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit2, Trash2, ChevronLeft } from 'lucide-react';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { BrewingDetail } from '../components/brewing/BrewingDetail';
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

        <BrewingDetail entry={entry} />
      </div>
    </Layout>
  );
}
