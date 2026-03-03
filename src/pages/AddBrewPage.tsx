import { useNavigate, useLocation } from 'react-router-dom';
import { BrewingForm, BrewFormValues } from '../components/brewing/BrewingForm';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrewingEntry } from '../types/brewing';

export function AddBrewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addEntry } = useBrewingEntries();

  const duplicateFrom = (location.state as { duplicateFrom?: BrewingEntry } | null)?.duplicateFrom;

  // When duplicating, pre-fill all fields except identity, rating and guest ratings.
  const formEntry: BrewingEntry | undefined = duplicateFrom
    ? { ...duplicateFrom, id: crypto.randomUUID(), createdAt: '', updatedAt: '', rating: 0, guestRatings: [] }
    : undefined;

  const handleSubmit = (data: BrewFormValues) => {
    const now = new Date().toISOString();
    addEntry({
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      coffeeProducer: data.coffeeProducer,
      countryOfOrigin: data.countryOfOrigin,
      coffeeVariety: data.coffeeVariety?.length ? data.coffeeVariety : undefined,
      grindCoarseness: data.grindCoarseness,
      grindEquipment: data.grindEquipment,
      brewingMethod: data.brewingMethod,
      brewingMethodCustom: data.brewingMethodCustom || undefined,
      gramsOfCoffee: data.gramsOfCoffee,
      millilitersOfWater: data.millilitersOfWater,
      waterSource: data.waterSource,
      numberOfPeople: data.numberOfPeople,
      brewTimeSeconds: data.brewTimeNotApplicable ? null : data.brewMinutes * 60 + data.brewSeconds,
      rating: 0,
      comment: data.comment,
      guestRatings: [],
    });
    navigate('/');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Back to list">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Log a Brew</h1>
        </div>
        <BrewingForm entry={formEntry} initialStep={duplicateFrom ? 2 : undefined} onSubmit={handleSubmit} />
      </div>
    </Layout>
  );
}
