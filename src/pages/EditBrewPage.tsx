import { useNavigate, useParams, Link } from 'react-router-dom';
import { BrewingForm, BrewFormValues } from '../components/brewing/BrewingForm';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { ChevronLeft } from 'lucide-react';

export function EditBrewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, editEntry } = useBrewingEntries();

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

  const handleSubmit = (data: BrewFormValues) => {
    editEntry({
      ...entry,
      updatedAt: new Date().toISOString(),
      coffeeProducer: data.coffeeProducer,
      countryOfOrigin: data.countryOfOrigin,
      grindCoarseness: data.grindCoarseness,
      grindEquipment: data.grindEquipment,
      brewingMethod: data.brewingMethod,
      gramsOfCoffee: data.gramsOfCoffee,
      millilitersOfWater: data.millilitersOfWater,
      waterSource: data.waterSource,
      numberOfPeople: data.numberOfPeople,
      brewTimeSeconds: data.brewMinutes * 60 + data.brewSeconds,
      rating: data.rating,
      comment: data.comment,
      guestRatings: data.guestRatings,
    });
    navigate(`/brew/${entry.id}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/brew/${entry.id}`} aria-label="Back to detail">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Edit Brew</h1>
        </div>
        <BrewingForm entry={entry} onSubmit={handleSubmit} />
      </div>
    </Layout>
  );
}
